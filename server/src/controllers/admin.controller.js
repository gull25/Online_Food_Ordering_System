const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Rider = require('../models/Rider');
const ApiError = require('../utils/ApiError');


// @desc    Get all orders for the admin's restaurant
// @route   GET /api/admin/orders
// @access  Private (Admin / Restaurant Admin)
exports.getAdminOrders = asyncHandler(async (req, res, next) => {
    // If super admin, fetch all, otherwise fetch by restaurantId
    const query = req.user.role === 'admin'
        ? {}
        : { restaurant: req.user.restaurantId };

    const orders = await Order.find(query)
        .populate('user', 'name avatar email')
        .populate('items.menuItem', 'name price')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    Get analytics for the admin's restaurant
// @route   GET /api/admin/analytics
// @access  Private (Admin / Restaurant Admin)
exports.getAdminAnalytics = asyncHandler(async (req, res, next) => {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { restaurant: req.user.restaurantId };

    const orders = await Order.find(query).populate('restaurant', 'name rating images cuisine');

    // 1. Orders and Revenue
    const totalOrders = orders.length;
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const revenueSum = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. Unique Customers
    const uniqueUsers = new Set(orders.map(o => o.user?.toString()).filter(Boolean));

    // 3. Restaurants count
    const restaurantsCount = isAdmin ? await Restaurant.countDocuments() : 1;

    // 4. Time Series Data (Group by day of week)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timeSeriesMap = {};
    days.forEach(d => timeSeriesMap[d] = 0);

    validOrders.forEach(o => {
        const date = new Date(o.createdAt);
        const dayLabel = days[date.getDay()];
        timeSeriesMap[dayLabel] += (o.totalAmount || 0);
    });
    
    // Order correctly from Mon to Sun
    const timeSeriesData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        label: day,
        revenue: timeSeriesMap[day]
    }));

    // 5. Top Items
    const itemStats = {};
    validOrders.forEach(o => {
        if (o.items && Array.isArray(o.items)) {
            o.items.forEach(item => {
                const name = item.name;
                if (!itemStats[name]) itemStats[name] = { quantity: 0, revenue: 0 };
                itemStats[name].quantity += item.quantity;
                itemStats[name].revenue += (item.price * item.quantity);
            });
        }
    });
    const topItems = Object.keys(itemStats)
        .map(name => ({ name, ...itemStats[name] }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // 6. Top Restaurants
    const restStats = {};
    validOrders.forEach(o => {
        if (o.restaurant) {
            const id = o.restaurant._id.toString();
            if (!restStats[id]) {
                restStats[id] = {
                    name: o.restaurant.name,
                    rating: o.restaurant.rating || 0,
                    image: o.restaurant.images?.logo || '',
                    revenue: 0,
                };
            }
            restStats[id].revenue += (o.totalAmount || 0);
        }
    });
    const topRestaurants = Object.values(restStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // 7. Cuisine Distribution
    const cuisineStats = {};
    if (isAdmin) {
        const allRests = await Restaurant.find({}, 'cuisine');
        allRests.forEach(r => {
            if (r.cuisine) {
                r.cuisine.forEach(c => {
                    cuisineStats[c] = (cuisineStats[c] || 0) + 1;
                });
            }
        });
    } else {
        const rest = await Restaurant.findById(req.user.restaurantId);
        if (rest && rest.cuisine) {
            rest.cuisine.forEach(c => { cuisineStats[c] = 1; });
        }
    }
    const cuisineDistribution = Object.keys(cuisineStats).map(c => ({
        name: c,
        count: cuisineStats[c]
    }));

    res.status(200).json({
        success: true,
        data: {
            orders: { total: totalOrders, revenue: revenueSum },
            users: { totalCustomers: uniqueUsers.size },
            restaurants: { active: restaurantsCount, total: restaurantsCount },
            timeSeriesData,
            topRestaurants,
            topItems,
            cuisineDistribution
        }
    });
});

// @desc    Get riders for the admin's restaurant
// @route   GET /api/admin/riders
// @access  Private (restaurant_admin)
exports.getRiders = asyncHandler(async (req, res, next) => {
    const query = req.user.role === 'admin'
        ? {}
        : { restaurant: req.user.restaurantId };

    const riders = await Rider.find(query).sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: riders.length,
        data: riders
    });
});
