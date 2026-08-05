const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Restaurant = require('../models/restaurant.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

            req.user = await User.findById(decoded.id);

            if (!req.user) {
                throw new ApiError(404, 'User not found');
            }

            if (req.user.role === 'rider') {
                const Rider = require('../models/rider.model');
                const rider = await Rider.findOne({ user: req.user._id });
                if (rider) {
                    req.user.riderId = rider._id.toString();
                }
            }

            if (req.user.role === 'restaurant_admin') {
                const restaurant = await Restaurant.findOne({ owner: req.user._id });
                if (restaurant) {
                    req.user.restaurantId = restaurant._id.toString();
                }
            }

            next();
        } catch (error) {
            throw new ApiError(401, 'Not authorized, token failed');
        }
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized, no token');
    }
});

const optionalAuth = asyncHandler(async (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
            req.user = await User.findById(decoded.id);

            if (req.user && req.user.role === 'restaurant_admin') {
                const restaurant = await Restaurant.findOne({ owner: req.user._id });
                if (restaurant) {
                    req.user.restaurantId = restaurant._id.toString();
                }
            }
        } catch (error) {
            // Do nothing if token is invalid
        }
    }
    next();
});

module.exports = { protect, optionalAuth };

