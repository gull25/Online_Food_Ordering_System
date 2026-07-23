const User = require('../models/User');

class UserRepository {
    async findByEmail(email, selectPassword = false) {
        let query = User.findOne({ email });
        if (selectPassword) {
            query = query.select('+password');
        }
        return await query;
    }

    async findById(id) {
        return await User.findById(id);
    }

    async findAll() {
        return await User.find();
    }

    async create(userData) {
        return await User.create(userData);
    }

    async updateById(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }
}

module.exports = new UserRepository();
