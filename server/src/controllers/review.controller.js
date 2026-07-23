const asyncHandler = require('../utils/asyncHandler');
const Review = require('../models/Review');
const Order = require('../models/Order');

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

    if (order.status !== 'Delivered') {
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
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
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
