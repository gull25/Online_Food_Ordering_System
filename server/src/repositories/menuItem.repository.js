const MenuItem = require('../models/MenuItem');

class MenuItemRepository {
    async findByRestaurant(restaurantId) {
        return await MenuItem.find({ restaurant: restaurantId });
    }

    async findById(id) {
        return await MenuItem.findById(id);
    }

    async create(menuItemData) {
        return await MenuItem.create(menuItemData);
    }
    
    async update(id, menuItemData) {
        return await MenuItem.findByIdAndUpdate(id, menuItemData, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await MenuItem.findByIdAndDelete(id);
    }
}

module.exports = new MenuItemRepository();
