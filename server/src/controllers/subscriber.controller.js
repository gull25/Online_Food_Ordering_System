const Subscriber = require('../models/subscriber.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
exports.subscribe = asyncHandler(async (req, res, next) => {
    const { email, restaurantId } = req.body;

    if (!email) {
        return next(new ApiError(400, 'Please provide an email'));
    }

    try {
        const subscriber = await Subscriber.create({ email, restaurantId });
        res.status(201).json({
            success: true,
            data: subscriber
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'You are already subscribed to this restaurant\'s newsletter'));
        }
        next(error);
    }
});

// @desc    Get recent subscribers for a restaurant
// @route   GET /api/subscribers/recent
// @access  Private (Restaurant Admin)
exports.getRecentSubscribers = asyncHandler(async (req, res, next) => {
    const restaurantId = req.user.restaurantId;
    
    if (!restaurantId) {
        return next(new ApiError(403, 'User does not have an associated restaurant'));
    }

    const subscribers = await Subscriber.find({ 
        $or: [
            { restaurantId: restaurantId },
            { restaurantId: null },
            { restaurantId: { $exists: false } }
        ]
    })
        .sort({ createdAt: -1 })
        .limit(4);

    res.status(200).json({
        success: true,
        count: subscribers.length,
        data: subscribers
    });
});
