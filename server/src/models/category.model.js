const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a category name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters']
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters']
        },
        image: {
            type: String,
            default: 'no-photo.jpg'
        },
        order: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'Category must belong to a restaurant'],
            index: true
        }
    },
    {
        timestamps: true,
    }
);

categorySchema.index({ name: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
