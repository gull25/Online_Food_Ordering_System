const Rider = require('../models/rider.model');
const Order = require('../models/order.model');

class RiderRepository {
    async findByUserId(userId) {
        return await Rider.findOne({ user: userId }).populate('restaurant', 'name location');
    }

    async findById(riderId) {
        return await Rider.findById(riderId);
    }

    async create(data) {
        return await Rider.create(data);
    }

    async updateStatus(riderId, status) {
        return await Rider.findByIdAndUpdate(
            riderId,
            { status },
            { new: true }
        );
    }

    async updateLocation(riderId, lng, lat) {
        return await Rider.findByIdAndUpdate(
            riderId,
            {
                currentLocation: {
                    type: "Point",
                    coordinates: [lng, lat]
                }
            },
            { new: true }
        );
    }

    async getAssignedOrder(riderId) {
        return await Order.findOne({
            rider: riderId,
            status: { $in: ['Out For Delivery'] }
        })
        .populate('restaurant', 'name location address')
        .populate('user', 'name phone')
        .populate('items.menuItem')
        .lean();
    }

    async getCompletedOrders(riderId, filters = {}) {
        const query = { rider: riderId, status: 'Completed', ...filters };
        return await Order.find(query).sort({ createdAt: -1 }).lean();
    }

    async updateEarnings(riderId, amount) {
        return await Rider.findByIdAndUpdate(
            riderId,
            {
                $inc: {
                    totalEarnings: amount,
                    weeklyEarnings: amount,
                    totalDeliveries: 1
                }
            },
            { new: true }
        );
    }
}

module.exports = new RiderRepository();

