const restaurantRepository = require('../repositories/restaurant.repository');
const menuItemRepository = require('../repositories/menuItem.repository');
const ApiError = require('../utils/ApiError');

class RestaurantService {
    async getFeaturedRestaurants() {
        return await restaurantRepository.findAll({ isFeatured: true });
    }

    async getRestaurants(query = {}) {
        return await restaurantRepository.findAll(query);
    }

    async getRestaurantDetails(id) {
        const restaurant = await restaurantRepository.findById(id);
        if (!restaurant) {
            throw new ApiError(404, `Restaurant not found with id of ${id}`);
        }
        return restaurant;
    }

    async getRestaurantMenu(id) {
        const restaurant = await restaurantRepository.findById(id);
        if (!restaurant) {
            throw new ApiError(404, `Restaurant not found with id of ${id}`);
        }
        return await menuItemRepository.findByRestaurant(id);
    }

    async createRestaurant(data) {
        return await restaurantRepository.create(data);
    }

    async updateRestaurant(id, data) {
        let restaurant = await restaurantRepository.findById(id);
        if (!restaurant) {
            throw new ApiError(404, `Restaurant not found with id of ${id}`);
        }
        return await restaurantRepository.update(id, data);
    }

    async deleteRestaurant(id) {
        let restaurant = await restaurantRepository.findById(id);
        if (!restaurant) {
            throw new ApiError(404, `Restaurant not found with id of ${id}`);
        }
        await restaurantRepository.delete(id);
        return {};
    }

    async createMenuItem(restaurantId, data) {
        const restaurant = await restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new ApiError(404, `Restaurant not found with id of ${restaurantId}`);
        }
        data.restaurant = restaurantId;
        return await menuItemRepository.create(data);
    }

    async updateMenuItem(menuId, data) {
        let menuItem = await menuItemRepository.findById(menuId);
        if (!menuItem) {
            throw new ApiError(404, `Menu item not found with id of ${menuId}`);
        }
        return await menuItemRepository.update(menuId, data);
    }

    async deleteMenuItem(menuId) {
        let menuItem = await menuItemRepository.findById(menuId);
        if (!menuItem) {
            throw new ApiError(404, `Menu item not found with id of ${menuId}`);
        }
        await menuItemRepository.delete(menuId);
        return {};
    }
}

module.exports = new RestaurantService();
