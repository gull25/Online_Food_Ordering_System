const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
    // Inject restaurantId into the request body
    req.body.restaurantId = req.user.restaurantId;

    if (!req.body.restaurantId) {
        return next(new ApiError(400, 'User is not linked to a restaurant'));
    }

    if (req.file) {
        const { uploadImage } = require('../services/upload.service');
        req.body.image = await uploadImage(req.file.buffer, 'foodora/categories');
    }

    try {
        const category = await Category.create(req.body);
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'A category with this name already exists in your restaurant'));
        }
        next(error);
    }
});

// @desc    Get all categories for a restaurant
// @route   GET /api/categories/restaurant/:restaurantId
// @access  Public
exports.getCategoriesByRestaurant = asyncHandler(async (req, res, next) => {
    const categories = await Category.find({ restaurantId: req.params.restaurantId }).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
    let category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ApiError(404, 'Category not found'));
    }

    // Ensure the admin owns this category's restaurant
    if (category.restaurantId.toString() !== req.user.restaurantId?.toString() && req.user.role !== 'super_admin') {
        return next(new ApiError(403, 'Not authorized to update this category'));
    }

    if (req.file) {
        const { uploadImage } = require('../services/upload.service');
        req.body.image = await uploadImage(req.file.buffer, 'foodora/categories');
    }

    try {
        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'A category with this name already exists in your restaurant'));
        }
        next(error);
    }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ApiError(404, 'Category not found'));
    }

    // Ensure the admin owns this category's restaurant
    if (category.restaurantId.toString() !== req.user.restaurantId?.toString() && req.user.role !== 'super_admin') {
        return next(new ApiError(403, 'Not authorized to delete this category'));
    }

    // Prevent deletion if items are associated with this category
    const itemsCount = await MenuItem.countDocuments({ category: req.params.id });
    if (itemsCount > 0) {
        return next(new ApiError(400, `Cannot delete category. There are ${itemsCount} menu item(s) in this category. Please move or delete them first.`));
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
