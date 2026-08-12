const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Order = require("../models/order.model");
const Restaurant = require("../models/restaurant.model");
const Rider = require("../models/rider.model");

/**
 * Builds the restaurant filter for the calling admin.
 *
 * This is the single most important line in the file. It used to read
 *
 *     req.user.role === 'admin' ? {} : { restaurant: req.user.restaurantId }
 *
 * and `restaurantId` is undefined for a restaurant_admin who has not created a
 * restaurant yet. Mongo drops undefined values from a filter, so the query
 * became `{}` — the platform-wide one. Since anyone could self-register as a
 * restaurant owner, `GET /api/admin/orders` returned every order on the
 * platform, and `/reports/sales` exported every customer's name and email as a
 * CSV, to an account that was seconds old.
 */
const scopeFor = (user) => {
    if (user.role === "admin" || user.role === "super_admin") return {};

    if (!user.restaurantId) {
        throw new ApiError(400, "Set up your restaurant to see orders and analytics");
    }

    return { restaurant: user.restaurantId };
};

// @desc    Orders for the caller's restaurant
// @route   GET /api/admin/orders
// @access  Private (restaurant owner / admin)
exports.getAdminOrders = asyncHandler(async (req, res) => {
    const scope = scopeFor(req.user);
    const { page, limit, status } = req.query;

    // Unpaginated before: an established restaurant's entire order history, with
    // every line item populated, in one response.
    const query = { ...scope, ...(status ? { status } : {}) };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Order.find(query)
            .select("status paymentStatus paymentMethod totalAmount items rider createdAt deliveryAddress restaurant user")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name avatar email")
            .populate("rider", "name phone")
            .lean(),
        Order.countDocuments(query),
    ]);

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: items,
    });
});

/**
 * Dashboard analytics.
 *
 * Previously this loaded every order for the scope into Node — with the
 * restaurant document populated onto each one — and then computed totals,
 * per-weekday revenue, top items and top restaurants with nested JavaScript
 * loops. Memory and latency grew linearly with order history, and the
 * "excluding cancelled orders" filter compared against `'Cancelled'` while the
 * schema enum stores `'CANCELLED'`, so cancelled orders were silently counted
 * as revenue.
 *
 * One `$facet` aggregation does the same work in the database, in a single round
 * trip, over indexed fields.
 */
exports.getAdminAnalytics = asyncHandler(async (req, res) => {
    const scope = scopeFor(req.user);
    const isPlatformAdmin = Object.keys(scope).length === 0;

    const EXCLUDED = ["CANCELLED", "REJECTED", "PAYMENT_FAILED", "PENDING_PAYMENT"];

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const match = { ...scope };
    if (scope.restaurant) match.restaurant = new mongoose.Types.ObjectId(String(scope.restaurant));

    const [facets] = await Order.aggregate([
        { $match: match },
        {
            $facet: {
                totals: [
                    {
                        $group: {
                            _id: null,
                            totalOrders: { $sum: 1 },
                            revenue: {
                                $sum: { $cond: [{ $in: ["$status", EXCLUDED] }, 0, "$totalAmount"] },
                            },
                            customers: { $addToSet: "$user" },
                        },
                    },
                    { $project: { totalOrders: 1, revenue: 1, customerCount: { $size: "$customers" } } },
                ],
                monthly: [
                    { $match: { status: { $nin: EXCLUDED }, createdAt: { $gte: startOfPreviousMonth } } },
                    {
                        $group: {
                            _id: { $cond: [{ $gte: ["$createdAt", startOfCurrentMonth] }, "current", "previous"] },
                            orders: { $sum: 1 },
                            revenue: { $sum: "$totalAmount" },
                            customers: { $addToSet: "$user" },
                        },
                    },
                    { $project: { orders: 1, revenue: 1, customerCount: { $size: "$customers" } } },
                ],
                byWeekday: [
                    { $match: { status: { $nin: EXCLUDED } } },
                    { $group: { _id: { $isoDayOfWeek: "$createdAt" }, revenue: { $sum: "$totalAmount" } } },
                ],
                topItems: [
                    { $match: { status: { $nin: EXCLUDED } } },
                    { $unwind: "$items" },
                    {
                        $group: {
                            _id: "$items.name",
                            quantity: { $sum: "$items.quantity" },
                            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                        },
                    },
                    { $sort: { quantity: -1 } },
                    { $limit: 5 },
                    { $project: { _id: 0, name: "$_id", quantity: 1, revenue: 1 } },
                ],
                topRestaurants: [
                    { $match: { status: { $nin: EXCLUDED } } },
                    { $group: { _id: "$restaurant", revenue: { $sum: "$totalAmount" } } },
                    { $sort: { revenue: -1 } },
                    { $limit: 5 },
                    {
                        $lookup: {
                            from: "restaurants",
                            localField: "_id",
                            foreignField: "_id",
                            as: "restaurant",
                            pipeline: [{ $project: { name: 1, rating: 1, "images.logo": 1 } }],
                        },
                    },
                    { $unwind: "$restaurant" },
                    {
                        $project: {
                            _id: 0,
                            name: "$restaurant.name",
                            rating: { $ifNull: ["$restaurant.rating", 0] },
                            image: { $ifNull: ["$restaurant.images.logo", ""] },
                            revenue: 1,
                        },
                    },
                ],
            },
        },
    ]);

    const totals = facets?.totals?.[0] ?? { totalOrders: 0, revenue: 0, customerCount: 0 };
    const current = facets?.monthly?.find((entry) => entry._id === "current") ?? {
        orders: 0,
        revenue: 0,
        customerCount: 0,
    };
    const previous = facets?.monthly?.find((entry) => entry._id === "previous") ?? {
        orders: 0,
        revenue: 0,
        customerCount: 0,
    };

    // `$isoDayOfWeek` is 1 = Monday … 7 = Sunday, which is already the order the
    // chart renders. The old code built a Sunday-first map and then re-ordered
    // it by hand.
    const revenueByDay = new Map(facets?.byWeekday?.map((entry) => [entry._id, entry.revenue]) ?? []);
    const timeSeriesData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, index) => ({
        label,
        revenue: Math.round((revenueByDay.get(index + 1) ?? 0) * 100) / 100,
    }));

    const growth = (currentValue, previousValue) => {
        if (previousValue === 0) return currentValue > 0 ? "+100.0%" : "0.0%";
        const value = ((currentValue - previousValue) / previousValue) * 100;
        return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
    };

    const [restaurantsCount, cuisineDistribution] = await Promise.all([
        isPlatformAdmin ? Restaurant.countDocuments() : 1,
        Restaurant.aggregate([
            ...(isPlatformAdmin
                ? []
                : [{ $match: { _id: new mongoose.Types.ObjectId(String(scope.restaurant)) } }]),
            { $unwind: "$cuisine" },
            { $group: { _id: "$cuisine", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 12 },
            { $project: { _id: 0, name: "$_id", count: 1 } },
        ]),
    ]);

    res.status(200).json({
        success: true,
        data: {
            orders: { total: totals.totalOrders, revenue: Math.round(totals.revenue * 100) / 100 },
            users: { totalCustomers: totals.customerCount },
            restaurants: { active: restaurantsCount, total: restaurantsCount },
            timeSeriesData,
            topRestaurants: facets?.topRestaurants ?? [],
            topItems: facets?.topItems ?? [],
            cuisineDistribution,
            trends: {
                orders: growth(current.orders, previous.orders),
                revenue: growth(current.revenue, previous.revenue),
                customers: growth(current.customerCount, previous.customerCount),
                restaurants: isPlatformAdmin ? "+0 new" : "N/A",
            },
        },
    });
});

// @desc    Riders available for assignment
// @route   GET /api/admin/riders
// @access  Private (restaurant owner / admin)
exports.getRiders = asyncHandler(async (req, res) => {
    scopeFor(req.user);

    // Only what the assignment dropdown needs. The whole rider document —
    // including `totalEarnings` and the full `payoutHistory` — was returned to
    // every restaurant admin before.
    const riders = await Rider.find({ status: { $ne: "Offline" } })
        .select("name phone vehicleDetails status rating totalDeliveries")
        .sort({ status: 1, name: 1 })
        .limit(200)
        .lean();

    res.status(200).json({ success: true, count: riders.length, data: riders });
});

/**
 * CSV export.
 *
 * The previous implementation quoted values and called that "escaping to prevent
 * CSV injection" — but quoting is a formatting fix, not a security one. A
 * customer who registers as `=cmd|'/c calc'!A0` still lands in a cell that Excel
 * and Sheets evaluate as a formula when the restaurant opens the report. Values
 * beginning with a formula trigger are prefixed with an apostrophe so the
 * spreadsheet treats them as text.
 */
const csvCell = (value) => {
    const text = String(value ?? "");
    const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${guarded.replace(/"/g, '""')}"`;
};

// @desc    Download a sales report
// @route   GET /api/admin/reports/sales
// @access  Private (restaurant owner / admin)
exports.downloadSalesReport = asyncHandler(async (req, res) => {
    const scope = scopeFor(req.user);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="sales_report.csv"');
    res.write("Order ID,Date,Customer Name,Customer Email,Status,Payment,Items,Total\n");

    /*
     * Streamed with a cursor rather than materialised. `Order.find()` on a busy
     * restaurant built the entire result set, and then an entire CSV string, in
     * memory before sending a single byte.
     */
    const cursor = Order.find(scope)
        .select("createdAt status paymentStatus items totalAmount user")
        .sort({ createdAt: -1 })
        .populate("user", "name email")
        .lean()
        .cursor();

    for await (const order of cursor) {
        res.write(
            [
                csvCell(order._id),
                csvCell(new Date(order.createdAt).toISOString().slice(0, 10)),
                csvCell(order.user?.name ?? "Guest"),
                csvCell(order.user?.email ?? "N/A"),
                csvCell(order.status),
                csvCell(order.paymentStatus),
                csvCell(Array.isArray(order.items) ? order.items.length : 0),
                csvCell((order.totalAmount ?? 0).toFixed(2)),
            ].join(",") + "\n",
        );
    }

    res.end();
});
