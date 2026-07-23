const Restaurant = require('../models/Restaurant');

class RestaurantRepository {
    async findAll(query = {}) {
        return await Restaurant.find(query);
    }

    async findById(id) {
        return await Restaurant.findById(id);
    }

    async create(restaurantData) {
        return await Restaurant.create(restaurantData);
    }

    async update(id, restaurantData) {
        return await Restaurant.findByIdAndUpdate(id, restaurantData, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await Restaurant.findByIdAndDelete(id);
    }
}

module.exports = new RestaurantRepository();
