const Order = require('../models/order.model');

class OrderRepository {
    async create(data) {
        return await Order.create(data);
    }

    async findById(id) {
        return await Order.findById(id)
            .populate('restaurant', 'name images location address')
            .populate('rider', 'name phone vehicleDetails currentLocation')
            .populate('user', 'name avatar')
            .populate('items.menuItem')
            .lean();
    }

    async findByUser(userId) {
        return await Order.find({ user: userId }).sort({ createdAt: -1 }).populate('restaurant', 'name image').lean();
    }

    async findAll(query = {}) {
        return await Order.find(query).sort({ createdAt: -1 }).populate('user', 'name image').populate('restaurant', 'name image').lean();
    }

    async updateStatus(id, status) {
        return await Order.findByIdAndUpdate(
            id, 
            { 
                status,
                $push: { statusHistory: { status, timestamp: new Date() } }
            }, 
            { new: true, runValidators: true }
        );
    }
}

module.exports = new OrderRepository();

