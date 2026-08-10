const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/review.model');
const Order = require('../models/order.model');

// @desc    Create a review for a restaurant
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res, next) => {
    const { restaurantId, orderId, rating, comment } = req.body;

    // Validate order belongs to user and is delivered
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'DELIVERED') {
        return res.status(400).json({ success: false, message: 'Can only review delivered orders' });
    }

    if (order.isReviewed) {
        return res.status(400).json({ success: false, message: 'Order has already been reviewed' });
    }

    // Ensure restaurant matches order
    if (order.restaurant.toString() !== restaurantId) {
        return res.status(400).json({ success: false, message: 'Restaurant ID does not match order' });
    }

    const review = await Review.create({
        restaurantId,
        orderId,
        user: req.user.id,
        rating,
        comment
    });

    // Mark order as reviewed
    order.isReviewed = true;
    await order.save();

    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
exports.getRestaurantReviews = asyncHandler(async (req, res, next) => {
    const ItemReview = require('../models/itemReview.model');
    
    // Fetch general restaurant reviews
    const generalReviews = await Review.find({ restaurantId: req.params.restaurantId })
        .populate({
            path: 'user',
            select: 'name avatar'
        })
        .lean();

    // Fetch item reviews for this restaurant
    const itemReviews = await ItemReview.find({ restaurantId: req.params.restaurantId })
        .populate({
            path: 'user',
            select: 'name avatar'
        })
        .lean();

    // Merge and sort by newest
    const allReviews = [...generalReviews, ...itemReviews]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
        success: true,
        count: allReviews.length,
        data: allReviews
    });
});

const ItemReview = require('../models/itemReview.model');

// @desc    Create a review for a food item
// @route   POST /api/reviews/item
// @access  Private
exports.createItemReview = asyncHandler(async (req, res, next) => {
    const { menuItemId, restaurantId, orderId, rating, comment } = req.body;

    // Validate order belongs to user and is delivered
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'DELIVERED') {
        return res.status(400).json({ success: false, message: 'Can only review delivered orders' });
    }

    // Ensure restaurant matches order
    if (order.restaurant.toString() !== restaurantId) {
        return res.status(400).json({ success: false, message: 'Restaurant ID does not match order' });
    }

    // Verify the menuItemId actually exists in the order
    const orderItem = order.items.find(item => item.menuItem.toString() === menuItemId);
    if (!orderItem) {
        return res.status(400).json({ success: false, message: 'Food item not found in this order' });
    }

    if (orderItem.isReviewed) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this item' });
    }

    const review = await ItemReview.create({
        menuItemId,
        restaurantId,
        orderId,
        user: req.user.id,
        rating,
        comment
    });

    // Mark specific order item as reviewed
    orderItem.isReviewed = true;
    await order.save();

    res.status(201).json({
        success: true,
        data: review
    });
});

// @desc    Get reviews for a specific food item
// @route   GET /api/reviews/item/:menuItemId
// @access  Public
exports.getItemReviews = asyncHandler(async (req, res, next) => {
    const reviews = await ItemReview.find({ menuItemId: req.params.menuItemId })
        .populate({
            path: 'user',
            select: 'name avatar'
        })
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
    });
});

