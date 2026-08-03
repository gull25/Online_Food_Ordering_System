const asyncHandler = require('../utils/asyncHandler');
const restaurantService = require('../services/restaurant.service');
const MenuItem = require('../models/MenuItem');

// @desc    Get all restaurants (or featured via query)
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {
    let restaurants;
    const options = {};
    
    let query = {};
    if (req.query.lat && req.query.lng) {
        query.lat = req.query.lat;
        query.lng = req.query.lng;
    }

    if (req.query.featured === 'true') {
        // Pass lat/lng into featured too if provided
        restaurants = await restaurantService.getFeaturedRestaurants(query, options);
    } else {
        restaurants = await restaurantService.getRestaurants(query, options);
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
    // If the requester is the owner, they can see their own restaurant
    const isOwner = req.user && req.user.restaurantId?.toString() === req.params.id;
    const options = { includeUnapproved: isOwner };

    const restaurant = await restaurantService.getRestaurantDetails(req.params.id, options);

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Get menu items for a restaurant
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getRestaurantMenu = asyncHandler(async (req, res, next) => {
    // If the requester is the owner, they can see their own restaurant
    const isOwner = req.user && req.user.restaurantId?.toString() === req.params.id;
    const options = { includeUnapproved: isOwner };

    const menuItems = await restaurantService.getRestaurantMenu(req.params.id, options);

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
    // Add user to req.body
    req.body.owner = req.body.owner || req.user.id;
    
    req.body.images = req.body.images || {};

    if (req.files) {
        const { uploadImage } = require('../services/upload.service');
        if (req.files.logo && req.files.logo[0]) {
            req.body.images.logo = await uploadImage(req.files.logo[0].buffer, 'foodora/logos');
        }
        if (req.files.banner && req.files.banner[0]) {
            req.body.images.banner = await uploadImage(req.files.banner[0].buffer, 'foodora/banners');
        }
    }

    const restaurant = await restaurantService.createRestaurant(req.body);

    // Update the user with the new restaurantId
    await require('../models/User').findByIdAndUpdate(req.user.id, {
        restaurantId: restaurant._id
    });

    res.status(201).json({
        success: true,
        data: restaurant
    });
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin
exports.updateRestaurant = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'restaurant_admin' && req.params.id !== req.user.restaurantId?.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
    }

    req.body.images = req.body.images || {};

    if (req.files) {
        const { uploadImage } = require('../services/upload.service');
        if (req.files.logo && req.files.logo[0]) {
            req.body.images.logo = await uploadImage(req.files.logo[0].buffer, 'foodora/logos');
        }
        if (req.files.banner && req.files.banner[0]) {
            req.body.images.banner = await uploadImage(req.files.banner[0].buffer, 'foodora/banners');
        }
    }

    const options = {};
    const restaurant = await restaurantService.updateRestaurant(req.params.id, req.body, options);

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'restaurant_admin' && req.params.id !== req.user.restaurantId?.toString()) {
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
    if (req.user.role === 'restaurant_admin' && req.params.id !== req.user.restaurantId?.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to add menu items to this restaurant' });
    }

    if (req.file) {
        const { uploadImage } = require('../services/upload.service');
        req.body.image = await uploadImage(req.file.buffer, 'foodora/menu');
    }
    
    if (typeof req.body.sizes === 'string') {
        try { req.body.sizes = JSON.parse(req.body.sizes); } catch(e){}
    }
    if (typeof req.body.addOns === 'string') {
        try { req.body.addOns = JSON.parse(req.body.addOns); } catch(e){}
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
    if (req.user.role === 'restaurant_admin') {
        const menuItem = await MenuItem.findById(req.params.menuId);
        if (!menuItem || menuItem.restaurant.toString() !== req.user.restaurantId?.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this menu item' });
        }
    }

    if (req.file) {
        const { uploadImage } = require('../services/upload.service');
        req.body.image = await uploadImage(req.file.buffer, 'foodora/menu');
    }

    if (typeof req.body.sizes === 'string') {
        try { req.body.sizes = JSON.parse(req.body.sizes); } catch(e){}
    }
    if (typeof req.body.addOns === 'string') {
        try { req.body.addOns = JSON.parse(req.body.addOns); } catch(e){}
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
    if (req.user.role === 'restaurant_admin') {
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
