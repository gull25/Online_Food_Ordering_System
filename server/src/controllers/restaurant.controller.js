const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const restaurantService = require("../services/restaurant.service");
const MenuItem = require("../models/menuItem.model");
const User = require("../models/user.model");
const { uploadImage } = require("../services/upload.service");

/**
 * True when the caller owns the restaurant in the URL.
 * Owners see their own listing even while it is Closed; everyone else does not.
 */
const isOwner = (req, restaurantId) =>
    Boolean(req.user?.restaurantId && req.user.restaurantId === String(restaurantId));

/** Uploads any files multer collected, keyed by field name. */
const collectImages = async (files, folders) => {
    if (!files) return {};

    const entries = await Promise.all(
        Object.entries(folders)
            .filter(([field]) => files[field]?.[0])
            .map(async ([field, folder]) => [field, await uploadImage(files[field][0].buffer, folder)]),
    );

    return Object.fromEntries(entries);
};

// @desc    List restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res) => {
    console.log("getRestaurants req.query:", req.query);
    const { items, total, page, limit } = await restaurantService.getRestaurants(req.query);
    console.log("getRestaurants items:", items.length);

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: items,
    });
});

// @desc    Restaurant detail
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await restaurantService.getRestaurantDetails(req.params.id, {
        includeUnapproved: isOwner(req, req.params.id),
    });

    res.status(200).json({ success: true, data: restaurant });
});

// @desc    Restaurant menu
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getRestaurantMenu = asyncHandler(async (req, res) => {
    const owner = isOwner(req, req.params.id);

    const menuItems = await restaurantService.getRestaurantMenu(req.params.id, {
        includeUnapproved: owner,
        // Customers should not see dishes the kitchen has switched off; the owner
        // needs to see them in order to switch them back on.
        includeUnavailable: owner,
    });

    res.status(200).json({ success: true, count: menuItems.length, data: menuItems });
});

// @desc    Create the caller's restaurant
// @route   POST /api/restaurants
// @access  Private (restaurant owner)
exports.createRestaurant = asyncHandler(async (req, res) => {
    const images = await collectImages(req.files, { logo: "foodora/logos", banner: "foodora/banners" });

    const restaurant = await restaurantService.createRestaurant(req.user.id, req.body, images);

    await User.findByIdAndUpdate(req.user.id, { restaurantId: restaurant._id });

    res.status(201).json({ success: true, data: restaurant });
});

// @desc    Update the caller's restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (owner)
exports.updateRestaurant = asyncHandler(async (req, res) => {
    if (req.user.role === "restaurant_admin" && !isOwner(req, req.params.id)) {
        throw new ApiError(403, "You can only edit your own restaurant");
    }

    const images = await collectImages(req.files, { logo: "foodora/logos", banner: "foodora/banners" });
    const restaurant = await restaurantService.updateRestaurant(req.params.id, req.body, images);

    res.status(200).json({ success: true, data: restaurant });
});

// @desc    Delete the caller's restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (owner)
exports.deleteRestaurant = asyncHandler(async (req, res) => {
    if (req.user.role === "restaurant_admin" && !isOwner(req, req.params.id)) {
        throw new ApiError(403, "You can only delete your own restaurant");
    }

    await restaurantService.deleteRestaurant(req.params.id);

    // The owner's stale pointer has to go too, or every subsequent request
    // resolves a restaurantId that no longer exists.
    await User.findByIdAndUpdate(req.user.id, { $unset: { restaurantId: "" } });

    res.status(200).json({ success: true, data: {} });
});

// @desc    Add a menu item
// @route   POST /api/restaurants/:id/menu
// @access  Private (owner)
exports.createMenuItem = asyncHandler(async (req, res) => {
    if (req.user.role === "restaurant_admin" && !isOwner(req, req.params.id)) {
        throw new ApiError(403, "You can only add items to your own menu");
    }

    const image = req.file ? await uploadImage(req.file.buffer, "foodora/menu") : null;
    const menuItem = await restaurantService.createMenuItem(req.params.id, req.body, image);

    res.status(201).json({ success: true, data: menuItem });
});

// @desc    Update a menu item
// @route   PUT /api/restaurants/menu/:menuId
// @access  Private (owner)
exports.updateMenuItem = asyncHandler(async (req, res) => {
    await assertOwnsMenuItem(req);

    const image = req.file ? await uploadImage(req.file.buffer, "foodora/menu") : null;
    const menuItem = await restaurantService.updateMenuItem(req.params.menuId, req.body, image);

    res.status(200).json({ success: true, data: menuItem });
});

// @desc    Delete a menu item
// @route   DELETE /api/restaurants/menu/:menuId
// @access  Private (owner)
exports.deleteMenuItem = asyncHandler(async (req, res) => {
    await assertOwnsMenuItem(req);

    await restaurantService.deleteMenuItem(req.params.menuId);

    res.status(200).json({ success: true, data: {} });
});

async function assertOwnsMenuItem(req) {
    if (req.user.role !== "restaurant_admin") return;

    const menuItem = await MenuItem.findById(req.params.menuId).select("restaurant").lean();
    if (!menuItem || menuItem.restaurant.toString() !== req.user.restaurantId) {
        // 404, not 403 — a 403 confirms the id belongs to a real menu item on
        // somebody else's menu.
        throw new ApiError(404, "Menu item not found");
    }
}
