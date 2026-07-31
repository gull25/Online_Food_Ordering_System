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
        enum: ['Pending', 'Preparing', 'Ready', 'Out For Delivery', 'Delivered', 'Completed', 'Cancelled'],
        default: 'Pending'
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
    paymentMethod: {
        type: String,
        required: true,
        default: 'visa'
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Failed'],
        default: 'Unpaid'
    },
    stripePaymentIntentId: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for common queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
