const Order = require('../models/Order');

class OrderRepository {
    async create(data) {
        return await Order.create(data);
    }

    async findById(id) {
        return await Order.findById(id).populate('restaurant', 'name image').populate('items.menuItem');
    }

    async findByUser(userId) {
        return await Order.find({ user: userId }).sort({ createdAt: -1 }).populate('restaurant', 'name image');
    }

    async findAll(query = {}) {
        return await Order.find(query).sort({ createdAt: -1 }).populate('user', 'name image').populate('restaurant', 'name image');
    }

    async updateStatus(id, status) {
        return await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    }
}

module.exports = new OrderRepository();
