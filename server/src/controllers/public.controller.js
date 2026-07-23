const asyncHandler = require('../utils/asyncHandler');
const MenuItem = require('../models/MenuItem');
const Offer = require('../models/Offer');
const Category = require('../models/Category');

// @desc    Get trending menu items
// @route   GET /api/public/trending
// @access  Public
exports.getTrending = asyncHandler(async (req, res, next) => {
    // Ideally this would be calculated by most ordered items.
    // For now, we will fetch random/featured items, or highest rated.
    // Since we don't have individual menu item ratings, we'll just fetch a few items across the DB.
    const items = await MenuItem.find({ isAvailable: true })
        .populate('restaurant', 'name rating')
        .limit(8);

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
    const offers = await Offer.find({ isActive: true }).populate('restaurant', 'name');
    const categories = await Category.find().populate('restaurant', 'name');

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
    const code = req.params.code.toUpperCase();
    
    // Find active offer with this code
    const offer = await Offer.findOne({ 
        code: code, 
        isActive: true,
        validUntil: { $gte: new Date() } // Ensure it hasn't expired
    });

    if (!offer) {
        return res.status(404).json({
            success: false,
            message: 'Invalid or expired promo code'
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
