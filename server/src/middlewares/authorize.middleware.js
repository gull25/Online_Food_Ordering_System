const ApiError = require('../utils/ApiError');

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER the `protect` middleware, as it relies on `req.user`.
 * 
 * @param  {...string} roles - Array of allowed roles (e.g., 'admin', 'user')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Not authorized, no user found'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ApiError(403, `User role '${req.user.role}' is not authorized to access this route`));
        }

        next();
    };
};

module.exports = { authorize };
