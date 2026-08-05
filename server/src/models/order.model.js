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
    ]
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
        ref: 'Rider'
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
        enum: ['cod', 'stripe', 'easypaisa', 'jazzcash']
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
    }
}, {
    timestamps: true
});

// Indexes for common queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ rider: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
