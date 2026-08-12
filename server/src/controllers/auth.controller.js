const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Fields safe to return for the signed-in user.
 *
 * `GET /api/auth/profile` used to answer with `req.user` verbatim — the whole
 * Mongoose document, including `resetPasswordToken` and `resetPasswordExpire`.
 * A live reset token in a routine profile response is a full account takeover
 * for anything that can read one response body (a logging proxy, an error
 * reporter, a browser extension). Serialising explicitly means new schema fields
 * are private until someone deliberately adds them here.
 */
const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    avatar: user.avatar ?? "",
    role: user.role,
    favorites: user.favorites ?? [],
    restaurantId: user.restaurantId ?? null,
    riderId: user.riderId ?? null,
    createdAt: user.createdAt,
});

class AuthController {
    register = asyncHandler(async (req, res) => {
        res.status(201).json(await authService.register(req.body));
    });

    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        res.status(200).json(await authService.login(email, password));
    });

    forgotPassword = asyncHandler(async (req, res) => {
        res.status(200).json(await authService.forgotPassword(req.body.email));
    });

    resetPassword = asyncHandler(async (req, res) => {
        res.status(200).json(await authService.resetPassword(req.params.token, req.body.password));
    });

    changePassword = asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        res.status(200).json(await authService.changePassword(req.user.id, currentPassword, newPassword));
    });

    profile = asyncHandler(async (req, res) => {
        res.status(200).json({ success: true, user: publicUser(req.user) });
    });
}

module.exports = new AuthController();
module.exports.publicUser = publicUser;
