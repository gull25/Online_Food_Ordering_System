const restaurantRepository = require('../repositories/restaurant.repository');
const menuItemRepository = require('../repositories/menuItem.repository');
const ApiError = require('../utils/ApiError');
const { geocodeAddress } = require('../utils/geocoder');

class RestaurantService {
    async getFeaturedRestaurants(query = {}, options = { includeUnapproved: false }) {
        return await restaurantRepository.findAll({ isFeatured: true, ...query }, options);
    }

    async getRestaurants(query = {}, options = { includeUnapproved: false }) {
        return await restaurantRepository.findAll(query, options);
    }

    async getRestaurantDetails(id) {
        const restaurant = await restaurantRepository.findById(id);
        if (!restaurant) {
            throw new ApiError(404, `Restaurant not found with id of ${id}`);
        }
        return restaurant;
    }

    async getRestaurantMenu(id, options = { includeUnapproved: false }) {
        const restaurant = await restaurantRepository.findById(id, options);
        if (!restaurant) {
            throw new ApiError(404, `Restaurant not found with id of ${id}`);
        }
        return await menuItemRepository.findByRestaurant(id);
    }

    async createRestaurant(data) {
        if (data.address && data.city && data.state && data.zipCode) {
            const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`;
            const coords = await geocodeAddress(fullAddress);
            if (coords) {
                data.location = {
                    type: 'Point',
                    coordinates: [coords.lng, coords.lat] // GeoJSON expects [longitude, latitude]
                };
            }
        }
        return await restaurantRepository.create(data);
    }

    async updateRestaurant(id, data, options = { includeUnapproved: false }) {
        let restaurant = await restaurantRepository.findById(id, options);
        if (!restaurant) {
            throw new ApiError(404, `Restaurant not found with id of ${id}`);
        }

        if (data.address || data.city || data.state || data.zipCode) {
            const addr = data.address || restaurant.address;
            const city = data.city || restaurant.city;
            const state = data.state || restaurant.state;
            const zip = data.zipCode || restaurant.zipCode;
            
            const fullAddress = `${addr}, ${city}, ${state} ${zip}`;
            const coords = await geocodeAddress(fullAddress);
            if (coords) {
                data.location = {
                    type: 'Point',
                    coordinates: [coords.lng, coords.lat]
                };
            }
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
