const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Please add a coupon code'],
            trim: true,
            uppercase: true,
            unique: true
        },
        discountType: {
            type: String,
            enum: ['Percentage', 'Fixed Amount'],
            required: true
        },
        discountValue: {
            type: Number,
            required: true
        },
        minOrderValue: {
            type: Number,
            default: 0
        },
        expiryDate: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        restaurant: {
            type: mongoose.Schema.ObjectId,
            ref: 'Restaurant',
            required: [true, 'Coupon must be associated with a restaurant']
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Coupon', couponSchema);
