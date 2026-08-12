const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const MenuItem = require("../models/menuItem.model");
const Offer = require("../models/offer.model");
const Category = require("../models/category.model");

// @desc    Most-ordered dishes
// @route   GET /api/public/trending
// @access  Public
exports.getTrending = asyncHandler(async (req, res) => {
    /*
     * Restricted to open restaurants. Sorting menu items by `orderCount` alone
     * surfaced dishes from closed and deleted restaurants on the home page, which
     * a customer could click through to a 404.
     */
    const items = await MenuItem.aggregate([
        { $match: { isAvailable: true, orderCount: { $gt: 0 } } },
        { $sort: { orderCount: -1 } },
        { $limit: 40 },
        {
            $lookup: {
                from: "restaurants",
                localField: "restaurant",
                foreignField: "_id",
                as: "restaurant",
                pipeline: [
                    { $match: { status: "Open" } },
                    { $project: { name: 1, rating: 1, "images.logo": 1, deliveryFee: 1, estimatedDeliveryTime: 1 } },
                ],
            },
        },
        { $unwind: "$restaurant" },
        { $limit: 10 },
        {
            $project: {
                name: 1,
                description: 1,
                price: 1,
                image: 1,
                rating: 1,
                numReviews: 1,
                orderCount: 1,
                vegNonVeg: 1,
                sizes: 1,
                addOns: 1,
                restaurant: 1,
            },
        },
    ]);

    res.status(200).json({ success: true, count: items.length, data: items });
});

// @desc    Home-page collections
// @route   GET /api/public/collections
// @access  Public
exports.getCollections = asyncHandler(async (req, res) => {
    // Both queries were unbounded and unfiltered by expiry, so the home page
    // fetched every offer ever created — including expired ones — plus every
    // category of every restaurant.
    const [offers, categories] = await Promise.all([
        Offer.find({ isActive: true, validUntil: { $gte: new Date() } })
            .select("title description discountPercentage image code validUntil restaurantId")
            .sort({ validUntil: 1 })
            .limit(12)
            .populate("restaurantId", "name images.logo")
            .lean(),
        Category.find({ isActive: true })
            .select("name image restaurantId")
            .sort({ order: 1 })
            .limit(12)
            .populate("restaurantId", "name")
            .lean(),
    ]);

    res.status(200).json({ success: true, data: { offers, categories } });
});

// @desc    Validate a promo code
// @route   GET /api/public/offers/validate/:code
// @access  Public
exports.validateOffer = asyncHandler(async (req, res) => {
    /*
     * An exact match, not `new RegExp(\`^${code}$\`, 'i')`.
     *
     * The old pattern interpolated raw user input into a regular expression, so
     * `GET /api/public/offers/validate/.*` matched the first live offer in the
     * collection and handed the caller a working discount they were never given,
     * and a code like `(a+)+b` pinned the event loop. Codes are stored uppercase
     * and constrained to `[A-Z0-9_-]` by the schema, so equality is exactly
     * equivalent — minus both failure modes.
     */
    const filter = {
        code: req.params.code,
        isActive: true,
        validUntil: { $gte: new Date() },
    };

    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;

    const offer = await Offer.findOne(filter).select("code discountPercentage title").lean();

    if (!offer) throw new ApiError(404, "That promo code is invalid, expired, or not valid here");

    res.status(200).json({
        success: true,
        data: { code: offer.code, discountPercentage: offer.discountPercentage, title: offer.title },
    });
});
