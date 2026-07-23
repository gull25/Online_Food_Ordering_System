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
        category: {
            type: String,
            required: [true, 'Please add a category'] // e.g., 'Starters', 'Mains', 'Desserts'
        },
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
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
