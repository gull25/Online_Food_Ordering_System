const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters']
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: [500, 'Description cannot be more than 500 characters']
        },
        cuisine: {
            type: [String],
            required: true,
        },
        image: {
            type: String,
            default: 'no-photo.jpg'
        },
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot be more than 5'],
            default: 0
        },
        numReviews: {
            type: Number,
            default: 0
        },
        deliveryTime: {
            type: String,
            default: '25-35 min'
        },
        minOrder: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        owner: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Restaurant must have an owner (admin)']
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
