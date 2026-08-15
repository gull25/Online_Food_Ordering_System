const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Restaurant = require("../models/restaurant.model");
const env = require("../config/env");
const stripe = require("../config/stripe");

// @desc    Create a Stripe Express account and return an onboarding link
// @route   POST /api/stripe/onboard
// @access  Private (restaurant owner)
exports.onboardStripe = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    let accountId = restaurant.stripeAccountId;

    if (!accountId) {
        const account = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: req.user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: "company",
            company: { name: restaurant.name },
            metadata: { restaurantId: restaurant._id.toString() },
        });

        accountId = account.id;
        restaurant.stripeAccountId = accountId;
        await restaurant.save();
    }

    /*
     * Return and refresh URLs are built from the configured client origin, not
     * from `req.headers.origin`. The header is attacker-controlled, so the old
     * version let anyone mint a genuine Stripe onboarding link that redirected
     * the restaurant owner to a site of their choosing once onboarding finished —
     * a convincing setup for phishing the account credentials it just created.
     */
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${env.CLIENT_URL}/admin/stripe/refresh`,
        return_url: `${env.CLIENT_URL}/admin/stripe/return`,
        type: "account_onboarding",
    });

    res.status(200).json({ success: true, url: accountLink.url });
});

// @desc    Check onboarding status
// @route   GET /api/stripe/verify
// @access  Private (restaurant owner)
exports.verifyStripeStatus = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.user.restaurantId);
    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    if (!restaurant.stripeAccountId) {
        return res.status(200).json({
            success: true,
            isComplete: false,
            status: { detailsSubmitted: false, chargesEnabled: false, payoutsEnabled: false, requirements: [] },
        });
    }

    const account = await stripe.accounts.retrieve(restaurant.stripeAccountId);
    const isComplete = Boolean(account.details_submitted && account.charges_enabled);

    if (restaurant.stripeOnboardingComplete !== isComplete) {
        restaurant.stripeOnboardingComplete = isComplete;
        await restaurant.save();
    }

    /*
     * The whole Stripe `account` object used to be returned to the browser. It
     * carries the representative's personal details, the last four digits of the
     * external bank account, the tax id status and the full requirements tree —
     * none of which the UI uses, and all of which then sat in the client's memory
     * and any response logging. Only the four flags the screen actually renders
     * are sent.
     */
    res.status(200).json({
        success: true,
        isComplete,
        status: {
            detailsSubmitted: Boolean(account.details_submitted),
            chargesEnabled: Boolean(account.charges_enabled),
            payoutsEnabled: Boolean(account.payouts_enabled),
            requirements: account.requirements?.currently_due ?? [],
        },
    });
});
