const riderRepository = require('../repositories/rider.repository');
const orderRepository = require('../repositories/order.repository');
const ApiError = require('../utils/ApiError');
const socketManager = require('../socket');

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
        
        // Let's assume rider earns flat 10% of order total amount for this demo
        const riderEarning = order.totalAmount * 0.10;
        await riderRepository.updateEarnings(rider._id, riderEarning);

        return order;
    }

    async getEarnings(userId, period) {
        const rider = await this.getProfile(userId);
        
        // Mock virtual weekly chart for now
        const weeklyChart = [0, 0, 0, 0, 0, 0, 0];
        
        // We could aggregate from completed orders, but returning current model state + virtual
        return {
            availableBalance: rider.totalEarnings,
            basePay: rider.totalEarnings * 0.8,
            tips: rider.totalEarnings * 0.2,
            incentives: rider.rewardPoints,
            totalDeliveries: rider.totalDeliveries,
            hoursOnline: rider.totalDeliveries * 0.6, // proxy
            weeklyChart,
            payoutHistory: [
                { id: '1', date: new Date().toISOString(), amount: rider.totalEarnings, status: 'Completed', method: 'Bank Transfer' }
            ]
        };
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

        return {
            activeOrder,
            metrics: {
                todayEarnings,
                totalDeliveries: todayOrders.length,
                rating: rider.rating || 4.92,
                onlineTime: '3h 42m',
                acceptance: '94%',
                time: '4.2m'
            }
        };
    }
}

module.exports = new RiderService();

