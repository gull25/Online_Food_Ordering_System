const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please add an email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        trim: true,
        lowercase: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: false
    }
}, { timestamps: true });

// Prevent duplicate subscriptions per restaurant
subscriberSchema.index({ email: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
