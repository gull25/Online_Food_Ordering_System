const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
            // One rider profile per user. Without this, a race between two
            // concurrent requests that both auto-provisioned a profile left
            // duplicates, and `findOne` then returned whichever came first.
            unique: true
        },
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true
        },
        phone: {
            type: String,
            default: ''
        },
        vehicleDetails: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['Available', 'Busy', 'Offline'],
            default: 'Offline'
        },
        /*
         * Riders are platform-level couriers who pick up whichever order is
         * ready, so tying a profile to one restaurant never reflected how the
         * delivery flow actually works.
         *
         * Requiring it had a concrete cost: both the registration path and
         * `RiderService.getProfile` satisfied the constraint by inventing a
         * "System Default Restaurant" owned by the rider's own user account.
         * That record defaults to `status: 'Open'`, so a placeholder restaurant
         * with a fake address appeared in the public restaurant listing that
         * customers browse. The field is kept as an optional hint for future
         * restaurant-employed couriers; nothing depends on it being set.
         */
        restaurant: {
            type: mongoose.Schema.ObjectId,
            ref: 'Restaurant'
        },
        // ── Performance & Earnings Metrics ──────────────────────────────────
        totalEarnings: { type: Number, default: 0 },
        weeklyEarnings: { type: Number, default: 0 },
        totalDeliveries: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 },
        tier: {
            type: String,
            enum: ['Bronze', 'Silver', 'Gold'],
            default: 'Bronze'
        },
        rewardPoints: { type: Number, default: 0 },
        // ── Live location (updated via WebSocket every few seconds) ───────────
        currentLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],    // [longitude, latitude]
                default: [0, 0]
            }
        },
        // ── The order currently being delivered ───────────────────────────────
        currentOrderId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Order',
            default: null
        },
        // ── Payout History ────────────────────────────────────────────────────
        payoutHistory: [{
            amount: Number,
            date: { type: Date, default: Date.now },
            status: { type: String, enum: ['Completed', 'Processing', 'Failed'], default: 'Completed' },
            method: { type: String, default: 'Bank Transfer' }
        }]
    },
    {
        timestamps: true
    }
);

// Geospatial index for rider location queries
riderSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Rider', riderSchema);
