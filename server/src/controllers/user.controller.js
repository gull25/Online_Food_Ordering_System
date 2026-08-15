const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");
const { uploadImage, deleteImage } = require("../services/upload.service");
const { publicUser } = require("./auth.controller");

// @desc    Update the signed-in user's profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
    // Only `name` and `phone` are in `updateProfileSchema`, so the hand-rolled
    // "only allow updating name and phone" destructure the handler used to open
    // with is now enforced one layer up, for every field, automatically.
    const update = { ...req.body };

    let previousAvatar;
    if (req.file) {
        const current = await User.findById(req.user.id).select("avatar").lean();
        previousAvatar = current?.avatar;
        update.avatar = await uploadImage(req.file.buffer, "users");
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, {
        new: true,
        runValidators: true,
    }).lean();

    if (!user) throw new ApiError(404, "User not found");

    /*
     * The old avatar is deleted *after* the write succeeds. Deleting first — as
     * before — meant a failed upload left the user with no avatar at all, and the
     * original was already gone from the CDN.
     */
    if (previousAvatar && previousAvatar !== update.avatar) {
        deleteImage(previousAvatar).catch(() => {});
    }

    res.status(200).json({ success: true, data: publicUser(user) });
});

// @desc    The signed-in user's saved restaurants
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .select("favorites")
        .populate("favorites", "name images rating numReviews cuisine deliveryFee estimatedDeliveryTime status")
        .lean();

    res.status(200).json({ success: true, data: user?.favorites ?? [] });
});

// @desc    Add or remove a restaurant from favourites
// @route   PUT /api/users/favorites/:restaurantId
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;

    const exists = await Restaurant.exists({ _id: restaurantId });
    if (!exists) throw new ApiError(404, "Restaurant not found");

    /*
     * Done with `$addToSet` / `$pull` rather than the previous read-modify-write
     * (`findById` → `indexOf` → `push`/`splice` → `save`). Two taps in quick
     * succession both read the same array and the second overwrote the first, so
     * favouriting two restaurants rapidly reliably lost one of them.
     */
    const user = await User.findById(req.user.id).select("favorites").lean();
    const isFavorite = (user?.favorites ?? []).some((id) => id.toString() === restaurantId);

    const updated = await User.findByIdAndUpdate(
        req.user.id,
        isFavorite ? { $pull: { favorites: restaurantId } } : { $addToSet: { favorites: restaurantId } },
        { new: true },
    )
        .select("favorites")
        .lean();

    res.status(200).json({ success: true, data: updated.favorites, isFavorite: !isFavorite });
});
