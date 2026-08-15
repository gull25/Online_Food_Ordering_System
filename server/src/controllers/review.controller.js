const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Review = require("../models/review.model");
const ItemReview = require("../models/itemReview.model");
const Order = require("../models/order.model");

/**
 * Loads a delivered order the caller owns.
 *
 * `restaurantId` was previously taken from the request body and then compared
 * against the order — a round trip that existed only because the value came from
 * the client at all. It is read off the order here instead, which removes both
 * the extra field and the mismatch error it could produce.
 */
const loadReviewableOrder = async (orderId, userId) => {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) throw new ApiError(404, "Order not found");
    if (order.status !== "DELIVERED") throw new ApiError(400, "You can only review delivered orders");

    return order;
};

// @desc    Review a restaurant
// @route   POST /api/reviews
// @access  Private (customer who placed the order)
exports.createReview = asyncHandler(async (req, res) => {
    const { orderId, rating, comment } = req.body;

    const order = await loadReviewableOrder(orderId, req.user.id);
    if (order.isReviewed) throw new ApiError(409, "You have already reviewed this order");

    const review = await Review.create({
        restaurantId: order.restaurant,
        orderId: order._id,
        user: req.user.id,
        rating,
        comment,
    });

    order.isReviewed = true;
    await order.save();

    res.status(201).json({ success: true, data: review });
});

// @desc    Review one dish from an order
// @route   POST /api/reviews/item
// @access  Private (customer who placed the order)
exports.createItemReview = asyncHandler(async (req, res) => {
    const { orderId, menuItemId, rating, comment } = req.body;

    const order = await loadReviewableOrder(orderId, req.user.id);

    const orderItem = order.items.find((item) => item.menuItem.toString() === menuItemId);
    if (!orderItem) throw new ApiError(400, "That item is not part of this order");
    if (orderItem.isReviewed) throw new ApiError(409, "You have already reviewed this item");

    const review = await ItemReview.create({
        menuItemId,
        restaurantId: order.restaurant,
        orderId: order._id,
        user: req.user.id,
        rating,
        comment,
    });

    orderItem.isReviewed = true;
    await order.save();

    res.status(201).json({ success: true, data: review });
});

/**
 * All reviews for a restaurant, newest first.
 *
 * The old handler fetched *every* restaurant review and *every* item review for
 * the restaurant, concatenated both arrays in Node and sorted the result — then
 * returned the lot. `$unionWith` merges, sorts and paginates the two collections
 * in the database, so the response size no longer grows with the restaurant's
 * lifetime.
 */
exports.getRestaurantReviews = asyncHandler(async (req, res) => {
    const mongoose = require("mongoose");
    const restaurantId = new mongoose.Types.ObjectId(req.params.restaurantId);
    const { page, limit } = req.query;

    const projection = {
        rating: 1,
        comment: 1,
        createdAt: 1,
        user: 1,
        menuItemId: 1,
        restaurantId: 1,
    };

    const [result] = await Review.aggregate([
        { $match: { restaurantId } },
        { $project: projection },
        {
            $unionWith: {
                coll: "itemreviews",
                pipeline: [{ $match: { restaurantId } }, { $project: projection }],
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                items: [
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "user",
                            pipeline: [{ $project: { name: 1, avatar: 1 } }],
                        },
                    },
                    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "menuitems",
                            localField: "menuItemId",
                            foreignField: "_id",
                            as: "menuItem",
                            pipeline: [{ $project: { name: 1 } }],
                        },
                    },
                    { $unwind: { path: "$menuItem", preserveNullAndEmptyArrays: true } },
                ],
                total: [{ $count: "value" }],
            },
        },
    ]);

    const items = result?.items ?? [];
    const total = result?.total?.[0]?.value ?? 0;

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: items,
    });
});

// @desc    Reviews for one dish
// @route   GET /api/reviews/item/:menuItemId
// @access  Public
exports.getItemReviews = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const filter = { menuItemId: req.params.menuItemId };

    const [items, total] = await Promise.all([
        ItemReview.find(filter)
            .select("rating comment createdAt user")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user", "name avatar")
            .lean(),
        ItemReview.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: items,
    });
});
