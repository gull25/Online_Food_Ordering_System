const asyncHandler = require('../utils/asyncHandler');
const MenuItem = require('../models/menuItem.model');
const Offer = require('../models/offer.model');
const Category = require('../models/category.model');

// @desc    Get trending menu items
// @route   GET /api/public/trending
// @access  Public
exports.getTrending = asyncHandler(async (req, res, next) => {
    // Fetch top 8 items sorted by orderCount descending
    const items = await MenuItem.find({ isAvailable: true })
        .populate('restaurant', 'name rating')
        .sort({ orderCount: -1 })
        .limit(10);

    res.status(200).json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Get curated collections (Offers and Categories)
// @route   GET /api/public/collections
// @access  Public
exports.getCollections = asyncHandler(async (req, res, next) => {
    const offers = await Offer.find({ isActive: true }).populate('restaurantId', 'name');
    const categories = await Category.find({ isActive: true }).populate('restaurantId', 'name');

    res.status(200).json({
        success: true,
        data: {
            offers,
            categories
        }
    });
});

// @desc    Validate a promo code
// @route   GET /api/public/offers/validate/:code
// @access  Public
exports.validateOffer = asyncHandler(async (req, res, next) => {
    const code = req.params.code;
    const { restaurantId } = req.query;
    
    // Find active offer with this code (case-insensitive)
    const query = { 
        code: new RegExp(`^${code}$`, 'i'), 
        isActive: true,
        validUntil: { $gte: new Date() } // Ensure it hasn't expired
    };
    
    // Enforce restaurant context if provided (Prevent cross-restaurant promo abuse)
    if (restaurantId && restaurantId !== 'undefined' && restaurantId !== '') {
        query.restaurantId = restaurantId;
    }

    const offer = await Offer.findOne(query);

    if (!offer) {
        return res.status(404).json({
            success: false,
            message: 'Invalid, expired, or inapplicable promo code'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            code: offer.code,
            discountPercentage: offer.discountPercentage,
            title: offer.title
        }
    });
});

