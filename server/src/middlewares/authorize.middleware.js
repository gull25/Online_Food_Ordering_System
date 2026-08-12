const ApiError = require("../utils/ApiError");

/**
 * Restricts a route to specific roles. Must run after `protect`.
 *
 * @param {...string} roles Allowed role names.
 */
const authorize =
    (...roles) =>
    (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Not authorized, please log in"));
        }

        if (!roles.includes(req.user.role)) {
            // The old message echoed the caller's role back in the response
            // body. It tells the client nothing it can act on and confirms to a
            // probing account exactly which role it holds.
            return next(new ApiError(403, "You do not have permission to perform this action"));
        }

        next();
    };

/**
 * Requires a restaurant owner to have completed onboarding.
 *
 * Several controllers began with `req.user.restaurantId.toString()` and threw a
 * raw TypeError — surfacing as a 500 — for an owner who had not created their
 * restaurant yet. Doing the check once, declaratively, turns that into a clear
 * 400 at the routing layer.
 */
const requireRestaurant = (req, res, next) => {
    if (!req.user?.restaurantId) {
        return next(new ApiError(400, "Set up your restaurant before using this feature"));
    }
    next();
};

module.exports = { authorize, requireRestaurant };
