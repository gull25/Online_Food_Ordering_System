const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        index: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, { timestamps: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (restaurantId) {
    const obj = await this.aggregate([
        {
            $match: { restaurantId: restaurantId }
        },
        {
            $group: {
                _id: '$restaurantId',
                averageRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        if (obj[0]) {
            await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
                rating: Math.round(obj[0].averageRating * 10) / 10,
                numReviews: obj[0].numReviews
            });
        } else {
            await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
                rating: 0,
                numReviews: 0
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.restaurantId);
});

// Call getAverageRating after remove
reviewSchema.post('remove', async function () {
    await this.constructor.getAverageRating(this.restaurantId);
});

module.exports = mongoose.model('Review', reviewSchema);
