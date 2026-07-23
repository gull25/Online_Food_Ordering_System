const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    discountPercentage: {
        type: Number,
        default: 0
    },
    code: {
        type: String,
        uppercase: true,
        trim: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        default: 'no-photo.jpg'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
