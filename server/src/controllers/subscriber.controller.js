const asyncHandler = require("../utils/asyncHandler");
const Subscriber = require("../models/subscriber.model");

// @desc    Join a newsletter
// @route   POST /api/subscribers
// @access  Public
exports.subscribe = asyncHandler(async (req, res) => {
    const { email, restaurantId } = req.body;

    // The duplicate case (E11000 from the compound unique index) is mapped to a
    // 409 by the error middleware, so the hand-written try/catch is gone.
    const subscriber = await Subscriber.create({ email, restaurantId });

    res.status(201).json({
        success: true,
        // Only the fields the confirmation UI needs — the raw document was
        // returned before, echoing internal ids back to an anonymous caller.
        data: { email: subscriber.email, createdAt: subscriber.createdAt },
    });
});

// @desc    Recent signups for the caller's restaurant
// @route   GET /api/subscribers/recent
// @access  Private (restaurant owner)
exports.getRecentSubscribers = asyncHandler(async (req, res) => {
    /*
     * Scoped strictly to this restaurant.
     *
     * The previous `$or` also matched rows with no `restaurantId` — general
     * newsletter signups that belong to the platform, not to any one restaurant —
     * so every restaurant owner saw the email addresses of people who had never
     * interacted with them.
     */
    const subscribers = await Subscriber.find({ restaurantId: req.user.restaurantId })
        .select("email createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

    res.status(200).json({ success: true, count: subscribers.length, data: subscribers });
});
