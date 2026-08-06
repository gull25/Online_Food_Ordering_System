const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number']
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
        restaurant: {
            type: mongoose.Schema.ObjectId,
            ref: 'Restaurant',
            required: [true, 'Rider must be associated with a restaurant']
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
