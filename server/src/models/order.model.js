const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    selectedSize: {
        name: String,
        additionalPrice: Number
    },
    selectedAddOns: [
        {
            name: String,
            price: Number
        }
    ],
    isReviewed: {
        type: Boolean,
        default: false
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    tax: {
        type: Number,
        required: true,
        default: 0
    },
    serviceFee: {
        type: Number,
        required: true,
        default: 0
    },
    deliveryFee: {
        type: Number,
        required: true,
        default: 0
    },
    discountAmount: {
        type: Number,
        required: true,
        default: 0
    },
    promoCode: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REJECTED', 'REFUNDED'],
        default: 'PLACED'
    },
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider',
        // Explicit null (rather than absent) so `{ rider: null }` matches every
        // unclaimed order -- the filter the rider "available deliveries" query
        // relies on to stop showing work that is already taken.
        default: null
    },
    riderEarning: {
        type: Number,
        default: 0
    },
    isReviewed: {
        type: Boolean,
        default: false
    },
    deliveryAddress: {
        firstName: String,
        lastName: String,
        phone: String,
        city: String,
        streetAddress: String,
        instructions: String,
        lat: Number,
        lng: Number
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now }
    }],
    routeHistory: [{
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    paymentMethod: {
        type: String,
        required: true
    },
    paymentGateway: {
        type: String,
        // `meezan` and `ubl` were offered by the checkout screen and set by the
        // order service, but were missing from this enum -- so choosing either
        // bank transfer failed validation and the order was never created.
        enum: ['cod', 'stripe', 'easypaisa', 'jazzcash', 'meezan', 'ubl']
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'COD_PENDING', 'COD_PAID'],
        default: 'PENDING'
    },
    stripePaymentIntentId: {
        type: String
    },
    gatewayTransactionId: {
        type: String
    },
    estimatedDeliveryTime: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    cancelledBy: {
        type: String,
        enum: ['customer', 'restaurant', 'system']
    },
    idempotencyKey: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

// ---------------------------------------------------------------------------
// Indexes.
//
// The compound forms below match the exact shape of the queries the app runs,
// so each is served by an index scan rather than a filter over a partial one:
//   - restaurant + status + createdAt  -> the admin order list, filtered by tab
//   - status + rider + createdAt       -> the rider "available deliveries" feed
//   - stripePaymentIntentId            -> webhook lookups, previously a scan
// ---------------------------------------------------------------------------
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, rider: 1, createdAt: 1 });
orderSchema.index({ rider: 1, status: 1, updatedAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
