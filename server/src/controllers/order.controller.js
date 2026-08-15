const asyncHandler = require("../utils/asyncHandler");
const orderService = require("../services/order.service");

// @desc    Place an order
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
    /*
     * The user id is passed as an argument rather than spliced into `req.body`.
     * The old `req.body.user = req.user.id` worked, but it encouraged handing the
     * whole request body to Mongoose — which is how `status`, `paymentStatus`,
     * `totalAmount` and `riderEarning` all became client-settable.
     */
    const { order, clientSecret, paymentUrl } = await orderService.createOrder(req.user.id, req.body);

    res.status(201).json({ success: true, data: order, clientSecret, paymentUrl });
});

// @desc    Orders belonging to the signed-in customer
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
    const { items, total, page, limit } = await orderService.getMyOrders(req.user.id, req.query);

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: items,
    });
});

// @desc    One order, if the caller is a party to it
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user);
    res.status(200).json({ success: true, data: order });
});

// @desc    Advance an order's status
// @route   PUT /api/orders/:id/status
// @access  Private (party to the order)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, rejectionReason } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, req.user, { rejectionReason });

    res.status(200).json({ success: true, data: order });
});

// @desc    Assign a courier
// @route   PUT /api/orders/:id/rider
// @access  Private (owning restaurant / admin)
exports.assignRider = asyncHandler(async (req, res) => {
    const result = await orderService.assignRider(req.params.id, req.body.riderId, req.user);
    res.status(200).json({ success: true, data: result });
});
