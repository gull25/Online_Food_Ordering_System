const riderRepository = require('../repositories/rider.repository');
const orderRepository = require('../repositories/order.repository');
const ApiError = require('../utils/ApiError');
const socketManager = require('../socket');
const Order = require('../models/order.model');

class RiderService {
    async getProfile(userId) {
        let rider = await riderRepository.findByUserId(userId);
        if (!rider) {
            const User = require('../models/user.model');
            const user = await User.findById(userId);
            if (!user) throw new ApiError(404, 'User not found');
            
            const Restaurant = require('../models/restaurant.model');
            let dummyRestaurant = await Restaurant.findOne();
            if (!dummyRestaurant) {
                dummyRestaurant = await Restaurant.create({
                    owner: user._id,
                    name: 'System Default Restaurant',
                    description: 'Auto-generated for riders',
                    address: '123 Main St',
                    city: 'Berlin',
                    state: 'Berlin',
                    zipCode: '10115',
                    cuisine: ['Other'],
                    phone: '000-000-0000',
                    email: `dummy_${Date.now()}@test.com`
                });
            }
            const Rider = require('../models/rider.model');
            await Rider.create({
                user: userId,
                name: user.name,
                phone: user.phone || '000-000-0000',
                restaurant: dummyRestaurant._id
            });
            rider = await riderRepository.findByUserId(userId);
        }
        return rider;
    }

    async updateStatus(userId, status) {
        const validStatuses = ['Available', 'Busy', 'Offline'];
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, 'Invalid status');
        }

        const rider = await this.getProfile(userId);
        const updatedRider = await riderRepository.updateStatus(rider._id, status);

        // Notify client if connected
        try {
            socketManager.emitToUser(userId.toString(), 'rider:status_changed', { status });
        } catch (err) {
            console.error('[Socket.io] Error emitting rider status:', err.message);
        }

        return updatedRider;
    }

    async getActiveDelivery(userId) {
        const rider = await this.getProfile(userId);
        return await riderRepository.getAssignedOrder(rider._id);
    }

    async acceptDelivery(userId, orderId) {
        const rider = await this.getProfile(userId);
        const order = await orderRepository.findById(orderId);
        
        if (!order) throw new ApiError(404, 'Order not found');
        if (order.rider?._id.toString() !== rider._id.toString()) {
            throw new ApiError(403, 'You are not assigned to this order');
        }

        // Mark rider as Busy and link order
        const Rider = require('../models/rider.model');
        await Rider.findByIdAndUpdate(rider._id, {
            status: 'Busy',
            currentOrderId: orderId
        });

        return order;
    }

    async confirmPickup(userId, orderId) {
        const rider = await this.getProfile(userId);
        let order = await orderRepository.findById(orderId);

        if (!order) throw new ApiError(404, 'Order not found');
        if (order.rider?._id.toString() !== rider._id.toString()) {
            throw new ApiError(403, 'You are not assigned to this order');
        }

        const orderService = require('./order.service');
        return await orderService.updateOrderStatus(orderId, 'PICKED_UP', 'rider');
    }

    async startDelivery(userId, orderId) {
        const rider = await this.getProfile(userId);
        let order = await orderRepository.findById(orderId);

        if (!order) throw new ApiError(404, 'Order not found');
        if (order.rider?._id.toString() !== rider._id.toString()) {
            throw new ApiError(403, 'You are not assigned to this order');
        }

        const orderService = require('./order.service');
        return await orderService.updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', 'rider');
    }

    async confirmDelivery(userId, orderId) {
        const rider = await this.getProfile(userId);
        let order = await orderRepository.findById(orderId);

        if (!order) throw new ApiError(404, 'Order not found');
        if (order.rider?._id.toString() !== rider._id.toString()) {
            throw new ApiError(403, 'You are not assigned to this order');
        }

        const orderService = require('./order.service');
        order = await orderService.updateOrderStatus(orderId, 'DELIVERED', 'rider');

        // Free Rider
        await riderRepository.updateStatus(rider._id, 'Available');
        
        // Use pre-calculated earning from order, fallback to 10% for older orders
        const riderEarning = order.riderEarning !== undefined ? order.riderEarning : (order.totalAmount * 0.10);
        await riderRepository.updateEarnings(rider._id, riderEarning);

        return order;
    }

    async getEarnings(userId, period) {
        const rider = await this.getProfile(userId);
        
        // Aggregate real weekly chart
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        const dayOfWeek = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1; 
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyOrders = await Order.find({
            rider: rider._id,
            status: 'DELIVERED',
            updatedAt: { $gte: startOfWeek, $lte: endOfWeek }
        }).lean();

        const weeklyChart = [0, 0, 0, 0, 0, 0, 0];
        
        let basePay = 0;
        let tips = 0;

        weeklyOrders.forEach(order => {
            const date = new Date(order.updatedAt);
            const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
            const earn = order.riderEarning !== undefined ? order.riderEarning : (order.totalAmount * 0.10);
            weeklyChart[dayIndex] += earn;
            
            // For now, distribute it artificially if it's just a flat amount
            basePay += earn * 0.8;
            tips += earn * 0.2;
        });

        // Format date string for the frontend (e.g. "Oct 14 - Oct 20")
        const dateOptions = { month: 'short', day: 'numeric' };
        const dateRangeString = `${startOfWeek.toLocaleDateString('en-US', dateOptions)} - ${endOfWeek.toLocaleDateString('en-US', dateOptions)}`;
        
        // Sort payout history by newest first
        const sortedPayoutHistory = (rider.payoutHistory || []).sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
            availableBalance: rider.totalEarnings,
            basePay: basePay,
            tips: tips,
            incentives: rider.rewardPoints,
            totalDeliveries: rider.totalDeliveries,
            hoursOnline: rider.totalDeliveries * 0.6, // proxy
            weeklyChart,
            payoutHistory: sortedPayoutHistory,
            dateRangeString
        };
    }

    async cashOut(userId) {
        const rider = await this.getProfile(userId);
        if (rider.totalEarnings <= 0) {
            throw new ApiError(400, 'Insufficient balance for cash out');
        }
        
        const payout = {
            amount: rider.totalEarnings,
            date: new Date(),
            status: 'Completed',
            method: 'Instant Payout'
        };
        
        rider.payoutHistory.push(payout);
        rider.totalEarnings = 0; // Reset balance
        await rider.save();
        
        return payout;
    }

    async getPerformance(userId) {
        const rider = await this.getProfile(userId);
        
        return {
            overallRating: rider.rating || 4.92,
            ratingDistribution: [85, 10, 3, 1, 1], // mock
            tier: rider.tier || 'Silver Tier',
            regionRank: 'Top 5% in Region',
            tierProgress: 72,
            deliveriesForNextTier: 28,
            rewardPoints: '1,240',
            boostMultiplier: '1.2',
            insuranceTier: 'Standard Plus',
            onTimeRate: '98.5%',
            acceptanceRate: '94%',
            completionRate: '100%',
            avgPrepWait: '4.2 min',
            recentFeedback: []
        };
    }

    async getDashboardSummary(userId) {
        const rider = await this.getProfile(userId);
        const activeOrder = await this.getActiveDelivery(userId);
        
        // Aggregate today's stats from completed orders
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const todayOrders = await riderRepository.getCompletedOrders(rider._id, {
            createdAt: { $gte: startOfDay }
        });
        
        const todayEarnings = todayOrders.reduce((sum, ord) => sum + (ord.totalAmount * 0.10), 0);

        // Aggregate yesterday's stats
        const startOfYesterday = new Date(startOfDay);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const yesterdayOrders = await riderRepository.getCompletedOrders(rider._id, {
            createdAt: { $gte: startOfYesterday, $lt: startOfDay }
        });
        const yesterdayEarnings = yesterdayOrders.reduce((sum, ord) => sum + (ord.totalAmount * 0.10), 0);

        // Recent Deliveries
        const history = await orderRepository.findRiderHistory(rider._id);
        const recentDeliveries = history.slice(0, 5);

        // Weekly Chart Data (Current Week - Monday to Sunday)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)); // Monday
        startOfWeek.setHours(0,0,0,0);
        
        const weekOrders = await riderRepository.getCompletedOrders(rider._id, {
            createdAt: { $gte: startOfWeek }
        });

        const weeklyChart = [
            { dayName: 'MON', earnings: 0 },
            { dayName: 'TUE', earnings: 0 },
            { dayName: 'WED', earnings: 0 },
            { dayName: 'THU', earnings: 0 },
            { dayName: 'FRI', earnings: 0 },
            { dayName: 'SAT', earnings: 0 },
            { dayName: 'SUN', earnings: 0 },
        ];

        weekOrders.forEach(order => {
            let dayIndex = new Date(order.createdAt).getDay() - 1; 
            if (dayIndex === -1) dayIndex = 6; 
            if(dayIndex >= 0 && dayIndex < 7) {
                weeklyChart[dayIndex].earnings += (order.totalAmount * 0.10);
            }
        });

        return {
            activeOrder,
            metrics: {
                todayEarnings,
                yesterdayEarnings,
                remainingInShift: 4, // Mocked for now
                totalDeliveries: todayOrders.length,
                rating: rider.rating || 4.92,
                onlineTime: '3h 42m',
                acceptance: '94%',
                time: '4.2m'
            },
            recentDeliveries,
            weeklyChart
        };
    }
}

module.exports = new RiderService();

