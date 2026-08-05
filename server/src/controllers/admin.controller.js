const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/order.model');
const Restaurant = require('../models/restaurant.model');
const Rider = require('../models/rider.model');
const ApiError = require('../utils/ApiError');


exports.getAdminOrders = asyncHandler(async (req, res, next) => {
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

exports.getAdminAnalytics = asyncHandler(async (req, res, next) => {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { restaurant: req.user.restaurantId };

    const orders = await Order.find(query).populate('restaurant', 'name rating images cuisine');

    const totalOrders = orders.length;
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const revenueSum = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const uniqueUsers = new Set(orders.map(o => o.user?.toString()).filter(Boolean));

    const restaurantsCount = isAdmin ? await Restaurant.countDocuments() : 1;

    // Calculate Trends (Current Month vs Previous Month)
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    let currentMonthOrders = 0;
    let previousMonthOrders = 0;
    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;
    const currentMonthUsers = new Set();
    const previousMonthUsers = new Set();

    validOrders.forEach(o => {
        const orderDate = new Date(o.createdAt);
        if (orderDate >= startOfCurrentMonth) {
            currentMonthOrders++;
            currentMonthRevenue += (o.totalAmount || 0);
            if(o.user) currentMonthUsers.add(o.user.toString());
        } else if (orderDate >= startOfPreviousMonth && orderDate < startOfCurrentMonth) {
            previousMonthOrders++;
            previousMonthRevenue += (o.totalAmount || 0);
            if(o.user) previousMonthUsers.add(o.user.toString());
        }
    });

    const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? "+100.0%" : "0.0%";
        const growth = ((current - previous) / previous) * 100;
        return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
    };

    const trends = {
        orders: calculateGrowth(currentMonthOrders, previousMonthOrders),
        revenue: calculateGrowth(currentMonthRevenue, previousMonthRevenue),
        customers: calculateGrowth(currentMonthUsers.size, previousMonthUsers.size),
        restaurants: isAdmin ? "+0 new" : "N/A"
    };

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
            cuisineDistribution,
            trends
        }
    });
});

exports.getRiders = asyncHandler(async (req, res, next) => {
    const query = {};

    const riders = await Rider.find(query).sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: riders.length,
        data: riders
    });
});

exports.downloadSalesReport = asyncHandler(async (req, res, next) => {
    const query = req.user.role === 'admin'
        ? {}
        : { restaurant: req.user.restaurantId };

    const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 });

    // Build CSV String
    let csv = 'Order ID,Date,Customer Name,Customer Email,Status,Items Count,Total Amount\n';

    orders.forEach(order => {
        const id = order._id;
        const date = new Date(order.createdAt).toLocaleDateString();
        const customerName = order.user?.name || 'Guest';
        const customerEmail = order.user?.email || 'N/A';
        const status = order.status;
        const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
        const totalAmount = (order.totalAmount || 0).toFixed(2);

        // Escape quotes to prevent CSV injection/formatting issues
        const safeName = `"${customerName.replace(/"/g, '""')}"`;
        const safeEmail = `"${customerEmail.replace(/"/g, '""')}"`;

        csv += `${id},${date},${safeName},${safeEmail},${status},${itemsCount},${totalAmount}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.csv');
    res.status(200).send(csv);
});
