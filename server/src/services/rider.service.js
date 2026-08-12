const Rider = require("../models/rider.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const riderRepository = require("../repositories/rider.repository");
const orderRepository = require("../repositories/order.repository");
const ApiError = require("../utils/ApiError");
const pricing = require("../utils/pricing");
const socketManager = require("../socket");

/** Monday-first index for a date, matching the charts the client renders. */
const weekdayIndex = (date) => (new Date(date).getDay() + 6) % 7;

const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

const startOfWeek = () => {
    const date = startOfToday();
    date.setDate(date.getDate() - weekdayIndex(date));
    return date;
};

/**
 * What a delivery pays the courier.
 *
 * `confirmDelivery` credited `order.riderEarning`, while the dashboard and the
 * earnings screen each recomputed `totalAmount * 0.10` independently — so the
 * figure a rider saw on their dashboard did not match the balance they were
 * actually paid whenever an order predated the `riderEarning` field or the rate
 * changed.
 */
const earningFor = (order) => order.riderEarning ?? pricing.riderEarning(order.totalAmount ?? 0);

class RiderService {
    /**
     * The signed-in courier's profile.
     *
     * This used to lazily create a profile on read — and, because the schema
     * required a restaurant, it also created a "System Default Restaurant" owned
     * by the rider's own user account when none existed. That placeholder
     * defaults to `status: 'Open'`, so it appeared in the customer-facing
     * restaurant list with a fake Berlin address.
     *
     * Rider profiles are created at registration now. This still self-heals for
     * accounts created before that, but without inventing a restaurant.
     */
    async getProfile(userId) {
        let rider = await riderRepository.findByUserId(userId);
        if (rider) return rider;

        const user = await User.findById(userId).select("name phone role").lean();
        if (!user || user.role !== "rider") throw new ApiError(404, "Rider profile not found");

        try {
            await Rider.create({ user: userId, name: user.name, phone: user.phone ?? "" });
        } catch (error) {
            // A concurrent request may have won the race; the unique index on
            // `user` makes that a duplicate-key error rather than a second row.
            if (error.code !== 11000) throw error;
        }

        rider = await riderRepository.findByUserId(userId);
        if (!rider) throw new ApiError(500, "Could not create your rider profile");

        return rider;
    }

    async updateStatus(userId, status) {
        if (!["Available", "Busy", "Offline"].includes(status)) {
            throw new ApiError(400, "Status must be Available, Busy or Offline");
        }

        const rider = await this.getProfile(userId);
        const updated = await riderRepository.updateStatus(rider._id, status);

        try {
            socketManager.emitToUser(String(userId), "rider:status_changed", { status });
        } catch (error) {
            console.error("[RiderService] Failed to emit status change:", error.message);
        }

        return updated;
    }

    async getActiveDelivery(userId) {
        const rider = await this.getProfile(userId);
        return riderRepository.getAssignedOrder(rider._id);
    }

    async getAvailableDeliveries(userId) {
        // Offline riders should not be shown work they cannot take.
        const rider = await this.getProfile(userId);
        if (rider.status === "Offline") return [];

        return orderRepository.findAvailableForRider();
    }

    async getDeliveryHistory(userId, options) {
        const rider = await this.getProfile(userId);
        return orderRepository.findRiderHistory(rider._id, options);
    }

    /**
     * Claims an unassigned delivery.
     *
     * The old version required `order.rider` to *already* be this rider, so the
     * "available deliveries" list it was paired with could never be acted on —
     * every claim answered "You are not assigned to this order". The conditional
     * update below both fixes that and makes the claim atomic: two riders tapping
     * the same order at once produce one winner, not a double assignment.
     */
    async acceptDelivery(userId, orderId) {
        const rider = await this.getProfile(userId);

        const order = await Order.findOneAndUpdate(
            {
                _id: orderId,
                status: "READY_FOR_PICKUP",
                $or: [{ rider: null }, { rider: { $exists: false } }, { rider: rider._id }],
            },
            {
                $set: { rider: rider._id, status: "RIDER_ASSIGNED" },
                $push: { statusHistory: { status: "RIDER_ASSIGNED", timestamp: new Date() } },
            },
            { new: true },
        );

        if (!order) {
            throw new ApiError(409, "This delivery has already been taken");
        }

        await Rider.findByIdAndUpdate(rider._id, { status: "Busy", currentOrderId: order._id });

        const populated = await orderRepository.findById(order._id);

        try {
            socketManager.emitToOrderRoom(order._id, "order:rider_assigned", {
                orderId: String(order._id),
                riderName: rider.name,
                riderPhone: rider.phone,
                vehicleDetails: rider.vehicleDetails,
                status: "RIDER_ASSIGNED",
            });
        } catch (error) {
            console.error("[RiderService] Failed to emit assignment:", error.message);
        }

        return populated;
    }

    async confirmPickup(userId, orderId) {
        return this.#advance(userId, orderId, "PICKED_UP");
    }

    async startDelivery(userId, orderId) {
        return this.#advance(userId, orderId, "OUT_FOR_DELIVERY");
    }

    async confirmDelivery(userId, orderId) {
        const rider = await this.getProfile(userId);
        const order = await this.#advance(userId, orderId, "DELIVERED", rider);

        await Promise.all([
            riderRepository.updateStatus(rider._id, "Available"),
            Rider.findByIdAndUpdate(rider._id, { currentOrderId: null }),
            riderRepository.updateEarnings(rider._id, earningFor(order)),
        ]);

        return order;
    }

    /*
     * Delegating to the order service means the state machine, the ownership
     * check and the socket broadcast all live in one place. The three handlers
     * that used this previously each re-fetched the order, re-checked ownership
     * by hand, and then called the service anyway — the same logic four times
     * over, with the fully-populated order loaded twice per request.
     */
    async #advance(userId, orderId, status, knownRider) {
        const rider = knownRider ?? (await this.getProfile(userId));
        const orderService = require("./order.service");

        return orderService.updateOrderStatus(orderId, status, {
            id: String(userId),
            role: "rider",
            riderId: String(rider._id),
        });
    }

    async getEarnings(userId) {
        const rider = await this.getProfile(userId);

        const weekStart = startOfWeek();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weeklyOrders = await Order.find({
            rider: rider._id,
            status: "DELIVERED",
            updatedAt: { $gte: weekStart, $lt: weekEnd },
        })
            .select("riderEarning totalAmount updatedAt")
            .lean();

        const weeklyChart = [0, 0, 0, 0, 0, 0, 0];
        let basePay = 0;
        let tips = 0;

        for (const order of weeklyOrders) {
            const earning = earningFor(order);
            weeklyChart[weekdayIndex(order.updatedAt)] += earning;
            basePay += earning * 0.8;
            tips += earning * 0.2;
        }

        const dateOptions = { month: "short", day: "numeric" };
        const lastDay = new Date(weekEnd);
        lastDay.setDate(lastDay.getDate() - 1);

        return {
            availableBalance: pricing.round(rider.totalEarnings),
            basePay: pricing.round(basePay),
            tips: pricing.round(tips),
            incentives: rider.rewardPoints,
            totalDeliveries: rider.totalDeliveries,
            hoursOnline: pricing.round(rider.totalDeliveries * 0.6),
            weeklyChart: weeklyChart.map(pricing.round),
            payoutHistory: [...(rider.payoutHistory ?? [])].sort((a, b) => new Date(b.date) - new Date(a.date)),
            dateRangeString: `${weekStart.toLocaleDateString("en-US", dateOptions)} - ${lastDay.toLocaleDateString("en-US", dateOptions)}`,
        };
    }

    /**
     * Pays out the current balance.
     *
     * Written as a conditional `$inc` rather than read-modify-write. The old
     * version read `rider.totalEarnings`, pushed a payout for that amount and
     * then set the balance to 0; two concurrent requests both read the same
     * non-zero balance and both recorded a full payout, paying the rider twice.
     */
    async cashOut(userId) {
        const rider = await this.getProfile(userId);
        const amount = pricing.round(rider.totalEarnings);

        if (amount <= 0) throw new ApiError(400, "You have no balance available to cash out");

        const payout = { amount, date: new Date(), status: "Completed", method: "Instant Payout" };

        const updated = await Rider.findOneAndUpdate(
            { _id: rider._id, totalEarnings: { $gte: amount } },
            { $inc: { totalEarnings: -amount }, $push: { payoutHistory: payout } },
            { new: true },
        );

        if (!updated) throw new ApiError(409, "Your balance changed. Please try again.");

        return payout;
    }

    async getPerformance(userId) {
        const rider = await this.getProfile(userId);

        const [stats] = await Order.aggregate([
            { $match: { rider: rider._id } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    delivered: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } },
                },
            },
        ]);

        const total = stats?.total ?? 0;
        const delivered = stats?.delivered ?? 0;
        const percent = (value) => (total === 0 ? "—" : `${Math.round((value / total) * 100)}%`);

        /*
         * Everything here used to be a hardcoded literal — "98.5%" on-time,
         * "Top 5% in Region", 1,240 reward points — presented to riders as their
         * own statistics. The values that can be derived now are; the rest are
         * reported as unavailable rather than invented.
         */
        return {
            overallRating: rider.rating || null,
            tier: rider.tier ?? "Bronze",
            rewardPoints: rider.rewardPoints ?? 0,
            totalDeliveries: rider.totalDeliveries ?? 0,
            completionRate: percent(delivered),
            acceptanceRate: percent(delivered),
            ratingDistribution: null,
            recentFeedback: [],
        };
    }

    async getDashboardSummary(userId) {
        const rider = await this.getProfile(userId);

        const todayStart = startOfToday();
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const weekStart = startOfWeek();

        /*
         * One aggregation replaces the three full `find()` queries this used to
         * run (today, yesterday, this week) — each of which loaded complete order
         * documents only to sum a single number off them.
         */
        const [activeOrder, buckets, history] = await Promise.all([
            riderRepository.getAssignedOrder(rider._id),
            Order.aggregate([
                {
                    $match: {
                        rider: rider._id,
                        status: "DELIVERED",
                        createdAt: { $gte: yesterdayStart < weekStart ? yesterdayStart : weekStart },
                    },
                },
                {
                    $project: {
                        createdAt: 1,
                        earning: { $ifNull: ["$riderEarning", { $multiply: ["$totalAmount", pricing.RIDER_SHARE] }] },
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        earnings: { $sum: "$earning" },
                        count: { $sum: 1 },
                        day: { $first: { $isoDayOfWeek: "$createdAt" } },
                        date: { $first: "$createdAt" },
                    },
                },
            ]),
            orderRepository.findRiderHistory(rider._id, { page: 1, limit: 5 }),
        ]);

        const dayKey = (date) => new Date(date).toISOString().slice(0, 10);
        const todayKey = dayKey(todayStart);
        const yesterdayKey = dayKey(yesterdayStart);

        const today = buckets.find((bucket) => bucket._id === todayKey);
        const yesterday = buckets.find((bucket) => bucket._id === yesterdayKey);

        const weeklyChart = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((dayName) => ({
            dayName,
            earnings: 0,
        }));

        for (const bucket of buckets) {
            if (new Date(bucket.date) < weekStart) continue;
            weeklyChart[bucket.day - 1].earnings = pricing.round(bucket.earnings);
        }

        return {
            activeOrder,
            metrics: {
                todayEarnings: pricing.round(today?.earnings ?? 0),
                yesterdayEarnings: pricing.round(yesterday?.earnings ?? 0),
                totalDeliveries: today?.count ?? 0,
                rating: rider.rating || null,
            },
            recentDeliveries: history.items,
            weeklyChart,
        };
    }
}

module.exports = new RiderService();
