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
        enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
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
        instructions: String
    },
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

module.exports = mongoose.model('Order', orderSchema);
