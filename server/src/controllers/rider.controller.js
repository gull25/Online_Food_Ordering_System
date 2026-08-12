const asyncHandler = require("../utils/asyncHandler");
const riderService = require("../services/rider.service");

exports.getProfile = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.getProfile(req.user.id) });
});

exports.getDashboardSummary = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.getDashboardSummary(req.user.id) });
});

exports.getActiveDelivery = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.getActiveDelivery(req.user.id) });
});

exports.getAvailableDeliveries = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.getAvailableDeliveries(req.user.id) });
});

exports.getDeliveryHistory = asyncHandler(async (req, res) => {
    const { items, total, page, limit } = await riderService.getDeliveryHistory(req.user.id, req.query);

    res.status(200).json({
        success: true,
        count: items.length,
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: items,
    });
});

exports.updateStatus = asyncHandler(async (req, res) => {
    const data = await riderService.updateStatus(req.user.id, req.body.status);
    res.status(200).json({ success: true, data });
});

exports.acceptDelivery = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.acceptDelivery(req.user.id, req.params.id) });
});

exports.confirmPickup = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.confirmPickup(req.user.id, req.params.id) });
});

exports.startDelivery = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.startDelivery(req.user.id, req.params.id) });
});

exports.confirmDelivery = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.confirmDelivery(req.user.id, req.params.id) });
});

exports.getEarnings = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.getEarnings(req.user.id) });
});

exports.cashOut = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.cashOut(req.user.id) });
});

exports.getPerformance = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: await riderService.getPerformance(req.user.id) });
});
