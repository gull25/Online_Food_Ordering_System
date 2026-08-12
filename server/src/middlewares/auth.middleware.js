const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");
const Rider = require("../models/rider.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { verifyToken, extractBearerToken } = require("../config/jwt");

/*
 * Resolves the caller from a bearer token.
 *
 * Three problems with the previous implementation are fixed here.
 *
 * 1. `jwt.verify(token, process.env.JWT_SECRET || 'secretkey123')` accepted
 *    tokens signed with a constant published in this repository whenever the
 *    variable was unset. There is no fallback secret any more (see config/jwt).
 *
 * 2. `next()` was called *inside* the try block, so any synchronous throw from a
 *    downstream handler was caught here and re-reported as
 *    "401 Not authorized, token failed". Genuine 400s and 500s from controllers
 *    surfaced to users as spurious session expiries — and to the client's axios
 *    interceptor as a reason to log them out. Verification and dispatch are now
 *    separate.
 *
 * 3. Every authenticated request issued up to three sequential queries (user,
 *    then rider or restaurant). The role-specific lookup only runs for the roles
 *    that need it, and both are projected down to `_id`.
 */

const attachRoleContext = async (user) => {
    if (user.role === "rider") {
        const rider = await Rider.findOne({ user: user._id }).select("_id").lean();
        if (rider) user.riderId = rider._id.toString();
        return;
    }

    if (user.role === "restaurant_admin") {
        const restaurant = await Restaurant.findOne({ owner: user._id }).select("_id").lean();
        if (restaurant) user.restaurantId = restaurant._id.toString();
    }
};

/**
 * Loads the user for a verified token.
 * `password` is excluded by the schema's `select: false`; the reset fields are
 * excluded explicitly so a compromised handler cannot echo a live reset token.
 */
const loadUser = async (token) => {
    const decoded = verifyToken(token);
    // Tokens are issued with `sub`; `id` is accepted so sessions minted by the
    // previous implementation keep working until they expire.
    const userId = decoded.sub || decoded.id;
    if (!userId) throw new ApiError(401, "Invalid authentication token");

    const user = await User.findById(userId).select("-resetPasswordToken -resetPasswordExpire").lean();
    if (!user) throw new ApiError(401, "Your session is no longer valid. Please log in again.");

    // `lean()` gives a plain object, so `id` has to be provided explicitly —
    // controllers throughout the app read `req.user.id`.
    user.id = user._id.toString();
    await attachRoleContext(user);

    return user;
};

/** Rejects the request unless a valid session is present. */
const protect = asyncHandler(async (req, res, next) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
        throw new ApiError(401, "Not authorized, no token provided");
    }

    // Any jwt error (expired / malformed / wrong issuer) is mapped to the right
    // 401 message by the central error handler.
    req.user = await loadUser(token);

    next();
});

/** Populates `req.user` when credentials are present, but never rejects. */
const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = extractBearerToken(req.headers.authorization);

    if (token) {
        try {
            req.user = await loadUser(token);
        } catch {
            // An invalid token on a public route is simply an anonymous visitor.
            req.user = undefined;
        }
    }

    next();
});

module.exports = { protect, optionalAuth, loadUser };
