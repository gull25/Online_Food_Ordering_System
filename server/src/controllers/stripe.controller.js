const asyncHandler = require('../utils/asyncHandler');
const Restaurant = require('../models/restaurant.model');
const ApiError = require('../utils/ApiError');
const stripe = require('../config/stripe');

// @desc    Create Stripe Express account and get onboarding link
// @route   POST /api/stripe/onboard
// @access  Private/Admin
exports.onboardStripe = asyncHandler(async (req, res, next) => {
    // 1. Get the restaurant
    if (!req.user.restaurantId) {
        return next(new ApiError(400, 'User does not have a restaurant'));
    }

    const restaurant = await Restaurant.findById(req.user.restaurantId);

    if (!restaurant) {
        return next(new ApiError(404, 'Restaurant not found'));
    }

    // 2. Create a Stripe account if they don't have one
    let accountId = restaurant.stripeAccountId;
    if (!accountId) {
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US', // Adjust as needed
            email: req.user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'company',
            company: {
                name: restaurant.name
            }
        });

        accountId = account.id;
        restaurant.stripeAccountId = accountId;
        await restaurant.save();
    }

    // 3. Create Account Link for onboarding
    // In production, these should be your real frontend URLs
    const origin = req.headers.origin || 'http://localhost:5173';

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/admin/stripe/refresh`,
        return_url: `${origin}/admin/stripe/return`,
        type: 'account_onboarding',
    });

    res.status(200).json({
        success: true,
        url: accountLink.url
    });
});

// @desc    Verify Stripe onboarding status
// @route   GET /api/stripe/verify
// @access  Private/Admin
exports.verifyStripeStatus = asyncHandler(async (req, res, next) => {
    if (!req.user.restaurantId) {
        return next(new ApiError(400, 'User does not have a restaurant'));
    }

    const restaurant = await Restaurant.findById(req.user.restaurantId);

    if (!restaurant || !restaurant.stripeAccountId) {
        return next(new ApiError(404, 'Stripe account not initiated'));
    }

    const account = await stripe.accounts.retrieve(restaurant.stripeAccountId);

    // Stripe considers an account fully onboarded if charges and transfers are enabled
    // and details_submitted is true.
    const isComplete = account.details_submitted && account.charges_enabled;

    restaurant.stripeOnboardingComplete = isComplete;
    await restaurant.save();

    res.status(200).json({
        success: true,
        isComplete,
        account
    });
});

