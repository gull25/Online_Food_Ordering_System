const asyncHandler = require('../utils/asyncHandler');
const riderService = require('../services/rider.service');

// @desc    Get current rider profile
// @route   GET /api/rider/me
// @access  Private (Rider)
exports.getProfile = asyncHandler(async (req, res) => {
    const profile = await riderService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
});

// @desc    Get dashboard summary
// @route   GET /api/rider/dashboard
// @access  Private (Rider)
exports.getDashboardSummary = asyncHandler(async (req, res) => {
    const data = await riderService.getDashboardSummary(req.user.id);
    res.status(200).json({ success: true, data });
});

// @desc    Get active delivery
// @route   GET /api/rider/active
// @access  Private (Rider)
exports.getActiveDelivery = asyncHandler(async (req, res) => {
    const data = await riderService.getActiveDelivery(req.user.id);
    res.status(200).json({ success: true, data });
});

exports.getAvailableDeliveries = asyncHandler(async (req, res) => {
    const orderRepository = require('../repositories/order.repository');
    const data = await orderRepository.findAvailableForRider();
    res.status(200).json({ success: true, data });
});

exports.getDeliveryHistory = asyncHandler(async (req, res) => {
    const orderRepository = require('../repositories/order.repository');
    const rider = await riderService.getProfile(req.user.id);
    const data = await orderRepository.findRiderHistory(rider._id);
    res.status(200).json({ success: true, data });
});

// @desc    Update status
// @route   PUT /api/rider/status
// @access  Private (Rider)
exports.updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const data = await riderService.updateStatus(req.user.id, status);
    res.status(200).json({ success: true, data });
});

exports.acceptDelivery = asyncHandler(async (req, res) => {
    const data = await riderService.acceptDelivery(req.user.id, req.params.id);
    res.status(200).json({ success: true, data });
});

// @desc    Confirm pickup
// @route   PUT /api/rider/pickup/:id
// @access  Private (Rider)
exports.confirmPickup = asyncHandler(async (req, res) => {
    const data = await riderService.confirmPickup(req.user.id, req.params.id);
    res.status(200).json({ success: true, data });
});

// @desc    Start delivery
// @route   PUT /api/rider/start/:id
// @access  Private (Rider)
exports.startDelivery = asyncHandler(async (req, res) => {
    const data = await riderService.startDelivery(req.user.id, req.params.id);
    res.status(200).json({ success: true, data });
});

// @desc    Confirm delivery
// @route   PUT /api/rider/deliver/:id
// @access  Private (Rider)
exports.confirmDelivery = asyncHandler(async (req, res) => {
    const data = await riderService.confirmDelivery(req.user.id, req.params.id);
    res.status(200).json({ success: true, data });
});

// @desc    Get earnings
// @route   GET /api/rider/earnings
// @access  Private (Rider)
exports.getEarnings = asyncHandler(async (req, res) => {
    const { period } = req.query;
    const data = await riderService.getEarnings(req.user.id, period);
    res.status(200).json({ success: true, data });
});

// @desc    Cash out earnings
// @route   POST /api/rider/cashout
// @access  Private (Rider)
exports.cashOut = asyncHandler(async (req, res) => {
    const data = await riderService.cashOut(req.user.id);
    res.status(200).json({ success: true, data });
});

// @desc    Get performance
// @route   GET /api/rider/performance
// @access  Private (Rider)
exports.getPerformance = asyncHandler(async (req, res) => {
    const data = await riderService.getPerformance(req.user.id);
    res.status(200).json({ success: true, data });
});
