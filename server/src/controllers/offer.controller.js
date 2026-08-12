const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Offer = require("../models/offer.model");
const { uploadImage, deleteImage } = require("../services/upload.service");

/** Loads an offer the caller owns, or 404s. */
const loadOwnedOffer = async (offerId, user) => {
    const offer = await Offer.findById(offerId);
    if (!offer) throw new ApiError(404, "Offer not found");

    const isPlatformAdmin = user.role === "admin" || user.role === "super_admin";

    // `offer.restaurantId.toString() !== req.user.restaurantId.toString()` threw a
    // raw TypeError — surfacing as a 500 — for an owner with no restaurant yet.
    if (!isPlatformAdmin && offer.restaurantId.toString() !== user.restaurantId) {
        throw new ApiError(404, "Offer not found");
    }

    return offer;
};

// @desc    Live offers
// @route   GET /api/offers/active
// @access  Public
exports.getActiveOffers = asyncHandler(async (req, res) => {
    const filter = { isActive: true, validUntil: { $gte: new Date() } };
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const offers = await Offer.find(filter)
        .select("type title description discountPercentage code validUntil image restaurantId")
        .sort({ validUntil: 1 })
        .limit(60)
        // `populate('restaurantId', 'name image')` asked for a field that does not
        // exist on Restaurant — the schema has `images.logo` — so every offer card
        // rendered without its restaurant's logo.
        .populate("restaurantId", "name images.logo rating")
        .lean();

    res.status(200).json({ success: true, count: offers.length, data: offers });
});

// @desc    The caller's offers
// @route   GET /api/offers/mine
// @access  Private (restaurant owner)
exports.getMyOffers = asyncHandler(async (req, res) => {
    /*
     * Replaces `GET /offers/restaurant/:restaurantId`, whose only behaviour was
     * to compare the path parameter against the caller's own restaurant and
     * reject anything else. Taking the id from the session removes the parameter,
     * the comparison, and the 500 that comparison threw when `restaurantId` was
     * undefined.
     */
    const offers = await Offer.find({ restaurantId: req.user.restaurantId }).sort({ createdAt: -1 }).lean();

    res.status(200).json({ success: true, count: offers.length, data: offers });
});

// @desc    Create an offer
// @route   POST /api/offers
// @access  Private (restaurant owner)
exports.createOffer = asyncHandler(async (req, res) => {
    const image = req.file ? await uploadImage(req.file.buffer, "foodora/offers") : undefined;

    const offer = await Offer.create({
        ...req.body,
        restaurantId: req.user.restaurantId,
        ...(image ? { image } : {}),
    });

    res.status(201).json({ success: true, data: offer });
});

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private (owner)
exports.updateOffer = asyncHandler(async (req, res) => {
    const existing = await loadOwnedOffer(req.params.id, req.user);

    const image = req.file ? await uploadImage(req.file.buffer, "foodora/offers") : undefined;

    const offer = await Offer.findByIdAndUpdate(
        req.params.id,
        { ...req.body, ...(image ? { image } : {}) },
        { new: true, runValidators: true },
    ).lean();

    if (image && existing.image && existing.image !== "no-photo.jpg") {
        deleteImage(existing.image).catch(() => {});
    }

    res.status(200).json({ success: true, data: offer });
});

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private (owner)
exports.deleteOffer = asyncHandler(async (req, res) => {
    const offer = await loadOwnedOffer(req.params.id, req.user);

    await offer.deleteOne();

    if (offer.image && offer.image !== "no-photo.jpg") {
        deleteImage(offer.image).catch(() => {});
    }

    res.status(200).json({ success: true, data: {} });
});
