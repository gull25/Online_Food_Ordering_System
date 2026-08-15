const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Category = require("../models/category.model");
const MenuItem = require("../models/menuItem.model");
const { uploadImage, deleteImage } = require("../services/upload.service");

/** Loads a category the caller owns, or 404s. */
const loadOwnedCategory = async (categoryId, user) => {
    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(404, "Category not found");

    const isPlatformAdmin = user.role === "admin" || user.role === "super_admin";
    if (!isPlatformAdmin && category.restaurantId.toString() !== user.restaurantId) {
        // 404 rather than 403 — see the note in the order service; a 403 confirms
        // the id is real.
        throw new ApiError(404, "Category not found");
    }

    return category;
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (restaurant owner)
exports.createCategory = asyncHandler(async (req, res) => {
    const image = req.file ? await uploadImage(req.file.buffer, "foodora/categories") : undefined;

    // The duplicate-name case is handled centrally now: the unique compound index
    // raises E11000 and the error middleware turns that into a 409 with a clear
    // message. Both handlers used to wrap their write in a try/catch to do this
    // by hand.
    const category = await Category.create({
        ...req.body,
        restaurantId: req.user.restaurantId,
        ...(image ? { image } : {}),
    });

    res.status(201).json({ success: true, data: category });
});

// @desc    Categories for a restaurant
// @route   GET /api/categories/restaurant/:restaurantId
// @access  Public (owner also sees deactivated categories)
exports.getCategoriesByRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const isOwner = req.user?.restaurantId === restaurantId;

    /*
     * Customers get only the live categories — an inactive one still appeared in
     * the menu sidebar before, because nothing filtered on `isActive` at all. The
     * owner needs the full set in order to reactivate one, so the admin screens
     * (which send credentials) keep seeing everything.
     */
    const filter = { restaurantId, ...(isOwner ? {} : { isActive: true }) };

    const categories = await Category.find(filter)
        .select("name description image order isActive")
        .sort({ order: 1, createdAt: 1 })
        .lean();

    res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (owner)
exports.updateCategory = asyncHandler(async (req, res) => {
    const existing = await loadOwnedCategory(req.params.id, req.user);

    const image = req.file ? await uploadImage(req.file.buffer, "foodora/categories") : undefined;

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        { ...req.body, ...(image ? { image } : {}) },
        { new: true, runValidators: true },
    ).lean();

    if (image && existing.image && existing.image !== "no-photo.jpg") {
        deleteImage(existing.image).catch(() => {});
    }

    res.status(200).json({ success: true, data: category });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (owner)
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await loadOwnedCategory(req.params.id, req.user);

    const itemsCount = await MenuItem.countDocuments({ category: req.params.id });
    if (itemsCount > 0) {
        throw new ApiError(
            409,
            `This category still holds ${itemsCount} menu item${itemsCount === 1 ? "" : "s"}. Move or delete them first.`,
        );
    }

    await category.deleteOne();

    if (category.image && category.image !== "no-photo.jpg") {
        deleteImage(category.image).catch(() => {});
    }

    res.status(200).json({ success: true, data: {} });
});
