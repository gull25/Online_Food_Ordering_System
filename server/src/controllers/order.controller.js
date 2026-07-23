const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/order.service');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
    // Inject user ID into the body
    req.body.user = req.user.id;

    const result = await orderService.createOrder(req.body);

    res.status(201).json({
        success: true,
        data: result.order,
        clientSecret: result.clientSecret // Null if Cash on Delivery
    });
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await orderService.getMyOrders(req.user.id);

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res, next) => {
    const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);

    res.status(200).json({
        success: true,
        data: order
    });
});
