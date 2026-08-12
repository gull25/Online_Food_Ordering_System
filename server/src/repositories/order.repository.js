const Order = require("../models/order.model");

/*
 * Projections are explicit everywhere.
 *
 * `findById` used to `.populate('items.menuItem')` with no field list, pulling
 * the full menu document — description, ingredients, every size and add-on, the
 * image URL — for every line of every order, purely so the UI could show a
 * thumbnail. The same query also populated the whole customer document.
 *
 * List queries are paginated. `findByUser`, `findByRestaurant` and
 * `findAvailableForRider` each returned the entire matching collection, so a
 * long-standing account's order history grew without bound in a single response.
 */

const ORDER_LIST_FIELDS =
    "status paymentStatus paymentMethod totalAmount subtotal deliveryFee tax serviceFee discountAmount " +
    "items rider isReviewed createdAt updatedAt estimatedDeliveryTime deliveryAddress restaurant user";

const paginate = ({ page = 1, limit = 20 } = {}) => ({
    skip: (page - 1) * limit,
    limit,
    page,
});

class OrderRepository {
    async create(data) {
        return Order.create(data);
    }

    async findById(id) {
        return Order.findById(id)
            .populate("restaurant", "name images location address phone city deliveryFee")
            .populate("rider", "name phone vehicleDetails currentLocation")
            .populate("user", "name avatar phone email")
            .populate("items.menuItem", "name image price")
            .lean();
    }

    /** Raw document (not lean) for flows that need to save it back. */
    async findRawById(id) {
        return Order.findById(id);
    }

    async findByUser(userId, options) {
        const { skip, limit, page } = paginate(options);

        const [items, total] = await Promise.all([
            Order.find({ user: userId })
                .select(ORDER_LIST_FIELDS)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("restaurant", "name images")
                .populate("items.menuItem", "name image")
                .lean(),
            Order.countDocuments({ user: userId }),
        ]);

        return { items, total, page, limit };
    }

    async findByRestaurant(restaurantId, options = {}) {
        const { skip, limit, page } = paginate(options);
        const query = { restaurant: restaurantId };
        if (options.status) query.status = options.status;

        const [items, total] = await Promise.all([
            Order.find(query)
                .select(ORDER_LIST_FIELDS)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("user", "name avatar email phone")
                .populate("rider", "name phone")
                .lean(),
            Order.countDocuments(query),
        ]);

        return { items, total, page, limit };
    }

    /**
     * Orders a courier can claim.
     *
     * `rider: null` was missing before, so an order already handed to one rider
     * kept appearing in every other rider's available list until its status moved
     * on.
     */
    async findAvailableForRider(options = {}) {
        const { skip, limit } = paginate({ limit: 50, ...options });

        return Order.find({ status: "READY_FOR_PICKUP", rider: null })
            .select(ORDER_LIST_FIELDS)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .populate("restaurant", "name location address images")
            .populate("user", "name phone")
            .lean();
    }

    async findActiveForRider(riderId) {
        return Order.find({
            rider: riderId,
            status: { $in: ["RIDER_ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY"] },
        })
            .select(ORDER_LIST_FIELDS)
            .sort({ createdAt: 1 })
            .populate("restaurant", "name location address images")
            .populate("user", "name phone")
            .populate("items.menuItem", "name image")
            .lean();
    }

    async findRiderHistory(riderId, options = {}) {
        const { skip, limit, page } = paginate(options);
        const query = { rider: riderId, status: "DELIVERED" };

        const [items, total] = await Promise.all([
            Order.find(query)
                .select(ORDER_LIST_FIELDS)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("restaurant", "name address images")
                .populate("user", "name")
                .lean(),
            Order.countDocuments(query),
        ]);

        return { items, total, page, limit };
    }
}

module.exports = new OrderRepository();
