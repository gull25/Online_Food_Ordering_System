const asyncHandler = require('../utils/asyncHandler');
const orderRepository = require('../repositories/order.repository');
const restaurantRepository = require('../repositories/restaurant.repository');
const userRepository = require('../repositories/user.repository');

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.user.role === 'admin') {
        const myRestaurant = await restaurantRepository.findAll({ owner: req.user.id });
        if (!myRestaurant || myRestaurant.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }
        filter = { restaurant: myRestaurant[0]._id };
    }

    const orders = await orderRepository.findAll(filter);

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res, next) => {
    let orderFilter = {};
    let restaurantFilter = {};

    if (req.user.role === 'admin') {
        const myRestaurant = await restaurantRepository.findAll({ owner: req.user.id });
        if (!myRestaurant || myRestaurant.length === 0) {
             return res.status(200).json({
                 success: true,
                 data: { orders: { total:0, pending:0, completed:0, revenue:0 }, users: { totalCustomers:0 }, restaurants: { total:0, active:0, avgRating:0 } }
             });
        }
        orderFilter = { restaurant: myRestaurant[0]._id };
        restaurantFilter = { _id: myRestaurant[0]._id };
    }

    const orders = await orderRepository.findAll(orderFilter);
    const restaurants = await restaurantRepository.findAll(restaurantFilter);
    
    // For customers count, we can get unique users from the filtered orders
    const uniqueUserIds = new Set(orders.map(o => o.user?.toString()).filter(Boolean));
    const activeCustomers = uniqueUserIds.size;

    // Calculate metrics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
    
    const totalRevenue = orders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const activeRestaurants = restaurants.filter(r => r.status === 'Online').length;
    const totalRestaurants = restaurants.length;

    const avgRating = totalRestaurants > 0 
        ? (restaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / totalRestaurants).toFixed(1) 
        : 0;

    res.status(200).json({
        success: true,
        data: {
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                revenue: totalRevenue
            },
            users: {
                totalCustomers: activeCustomers
            },
            restaurants: {
                total: totalRestaurants,
                active: activeRestaurants,
                avgRating: parseFloat(avgRating)
            }
        }
    });
});
