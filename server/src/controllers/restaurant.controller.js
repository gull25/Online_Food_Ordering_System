const asyncHandler = require('../utils/asyncHandler');
const restaurantService = require('../services/restaurant.service');
const MenuItem = require('../models/MenuItem');

// @desc    Get all restaurants (or featured via query)
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {
    let restaurants;
    if (req.query.featured === 'true') {
        restaurants = await restaurantService.getFeaturedRestaurants();
    } else {
        restaurants = await restaurantService.getRestaurants();
    }
    
    res.status(200).json({
        success: true,
        count: restaurants.length,
        data: restaurants
    });
});

// @desc    Get single restaurant details
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = asyncHandler(async (req, res, next) => {
    const restaurant = await restaurantService.getRestaurantDetails(req.params.id);

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Get menu items for a restaurant
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getRestaurantMenu = asyncHandler(async (req, res, next) => {
    const menuItems = await restaurantService.getRestaurantMenu(req.params.id);

    res.status(200).json({
        success: true,
        count: menuItems.length,
        data: menuItems
    });
});

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private/Admin
exports.createRestaurant = asyncHandler(async (req, res, next) => {
    // Add user to req.body if not provided by superAdmin
    req.body.owner = req.body.owner || req.user.id;

    const restaurant = await restaurantService.createRestaurant(req.body);

    res.status(201).json({
        success: true,
        data: restaurant
    });
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'admin' && req.params.id !== req.user.restaurantId?.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
    }

    const restaurant = await restaurantService.updateRestaurant(req.params.id, req.body);

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'admin' && req.params.id !== req.user.restaurantId?.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this restaurant' });
    }

    await restaurantService.deleteRestaurant(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Create menu item
// @route   POST /api/restaurants/:id/menu
// @access  Private/Admin
exports.createMenuItem = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'admin' && req.params.id !== req.user.restaurantId?.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to add menu items to this restaurant' });
    }

    const menuItem = await restaurantService.createMenuItem(req.params.id, req.body);

    res.status(201).json({
        success: true,
        data: menuItem
    });
});

// @desc    Update menu item
// @route   PUT /api/restaurants/menu/:menuId
// @access  Private/Admin
exports.updateMenuItem = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'admin') {
        const menuItem = await MenuItem.findById(req.params.menuId);
        if (!menuItem || menuItem.restaurant.toString() !== req.user.restaurantId?.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this menu item' });
        }
    }

    const menuItem = await restaurantService.updateMenuItem(req.params.menuId, req.body);

    res.status(200).json({
        success: true,
        data: menuItem
    });
});

// @desc    Delete menu item
// @route   DELETE /api/restaurants/menu/:menuId
// @access  Private/Admin
exports.deleteMenuItem = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'admin') {
        const menuItem = await MenuItem.findById(req.params.menuId);
        if (!menuItem || menuItem.restaurant.toString() !== req.user.restaurantId?.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this menu item' });
        }
    }

    await restaurantService.deleteMenuItem(req.params.menuId);

    res.status(200).json({
        success: true,
        data: {}
    });
});
