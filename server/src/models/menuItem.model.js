const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
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
        price: {
            type: Number,
            required: [true, 'Please add a price']
        },
        discount: {
            type: Number,
            default: 0
        },
        ingredients: {
            type: [String],
            default: []
        },
        vegNonVeg: {
            type: String,
            enum: ['Veg', 'Non-Veg', 'N/A'],
            default: 'N/A'
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Please add a category']
        },
        sizes: [
            {
                name: { type: String, required: true },
                additionalPrice: { type: Number, required: true, default: 0 }
            }
        ],
        addOns: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true, default: 0 }
            }
        ],
        image: {
            type: String,
            default: 'no-photo.jpg'
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        restaurant: {
            type: mongoose.Schema.ObjectId,
            ref: 'Restaurant',
            required: [true, 'Please provide a restaurant for this menu item'],
            index: true
        },
        orderCount: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0,
            min: [0, 'Rating must be at least 0'],
            max: [5, 'Rating cannot be more than 5']
        },
        numReviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

menuItemSchema.index({ restaurant: 1, category: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
