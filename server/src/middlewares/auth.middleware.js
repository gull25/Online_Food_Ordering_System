const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
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

            if (req.user.role === 'admin') {
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

module.exports = { protect };
