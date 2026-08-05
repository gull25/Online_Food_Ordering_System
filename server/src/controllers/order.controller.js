const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/order.service');

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

exports.getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await orderService.getMyOrders(req.user.id);

    res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
    });
});

exports.getOrderById = asyncHandler(async (req, res, next) => {
    const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);

    res.status(200).json({
        success: true,
        data: order
    });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user.role, req.body);

    res.status(200).json({
        success: true,
        data: order
    });
});

exports.assignRider = asyncHandler(async (req, res, next) => {
    const { riderId } = req.body;
    const result = await orderService.assignRider(req.params.id, riderId, req.user.role);

    res.status(200).json({
        success: true,
        data: result
    });
});
