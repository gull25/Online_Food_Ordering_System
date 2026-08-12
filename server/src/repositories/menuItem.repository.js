const MenuItem = require("../models/menuItem.model");

const MENU_FIELDS =
    "name description price discount image category sizes addOns ingredients vegNonVeg " +
    "isAvailable rating numReviews orderCount restaurant createdAt";

class MenuItemRepository {
    /**
     * A restaurant's menu.
     *
     * Unavailable items were previously returned to everyone, so customers could
     * add a dish the kitchen had switched off straight into their cart — and only
     * found out when the order was rejected at checkout.
     */
    async findByRestaurant(restaurantId, { includeUnavailable = false } = {}) {
        const filter = { restaurant: restaurantId };
        if (!includeUnavailable) filter.isAvailable = true;

        return MenuItem.find(filter)
            .select(MENU_FIELDS)
            .populate("category", "name order")
            .sort({ "category.order": 1, name: 1 })
            .lean();
    }

    async findById(id) {
        return MenuItem.findById(id).select(MENU_FIELDS).lean();
    }

    async create(data) {
        return MenuItem.create(data);
    }

    async update(id, data) {
        return MenuItem.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    }

    async delete(id) {
        return MenuItem.findByIdAndDelete(id);
    }
}

module.exports = new MenuItemRepository();
