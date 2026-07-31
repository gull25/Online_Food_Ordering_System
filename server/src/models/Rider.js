const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema(
    {
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
        }
    },
    {
        timestamps: true
    }
);

// Geospatial index for rider location queries
riderSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Rider', riderSchema);
