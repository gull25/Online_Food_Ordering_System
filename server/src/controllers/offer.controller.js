const Offer = require('../models/offer.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get all active offers (Public)
// @route   GET /api/offers/active
// @access  Public
exports.getActiveOffers = asyncHandler(async (req, res, next) => {
    const query = {
        isActive: true,
        validUntil: { $gte: new Date() }
    };

    // Optional: Context filter for single-restaurant view
    if (req.query.restaurantId) {
        query.restaurantId = req.query.restaurantId;
    }

    const offers = await Offer.find(query).populate('restaurantId', 'name image');

    res.status(200).json({
        success: true,
        count: offers.length,
        data: offers
    });
});

// @desc    Get offers for a specific restaurant
// @route   GET /api/offers/restaurant/:restaurantId
// @access  Private (Restaurant Admin)
exports.getOffersByRestaurant = asyncHandler(async (req, res, next) => {
    // Ensure the user is requesting their own restaurant's offers
    if (req.user.restaurantId.toString() !== req.params.restaurantId && req.user.role !== 'admin') {
        return next(new ApiError(403, 'Not authorized to access these offers'));
    }

    const offers = await Offer.find({ restaurantId: req.params.restaurantId });

    res.status(200).json({
        success: true,
        count: offers.length,
        data: offers
    });
});

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private (Restaurant Admin)
exports.createOffer = asyncHandler(async (req, res, next) => {
    req.body.restaurantId = req.user.restaurantId; // Force restaurantId from logged in user

    if (!req.body.restaurantId) {
        return next(new ApiError(400, 'User does not have an associated restaurant'));
    }

    if (req.file) {
        req.body.image = req.file.path || req.file.filename;
    }

    const offer = await Offer.create(req.body);

    res.status(201).json({
        success: true,
        data: offer
    });
});

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private (Restaurant Admin)
exports.updateOffer = asyncHandler(async (req, res, next) => {
    let offer = await Offer.findById(req.params.id);

    if (!offer) {
        return next(new ApiError(404, `No offer found with id of ${req.params.id}`));
    }

    // Make sure user is offer owner
    if (offer.restaurantId.toString() !== req.user.restaurantId.toString() && req.user.role !== 'admin') {
        return next(new ApiError(403, 'Not authorized to update this offer'));
    }

    if (req.file) {
        req.body.image = req.file.path || req.file.filename;
    }

    offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: offer
    });
});

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private (Restaurant Admin)
exports.deleteOffer = asyncHandler(async (req, res, next) => {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
        return next(new ApiError(404, `No offer found with id of ${req.params.id}`));
    }

    // Make sure user is offer owner
    if (offer.restaurantId.toString() !== req.user.restaurantId.toString() && req.user.role !== 'admin') {
        return next(new ApiError(403, 'Not authorized to delete this offer'));
    }

    await offer.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

