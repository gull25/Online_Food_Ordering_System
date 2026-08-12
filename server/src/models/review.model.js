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

// One restaurant review per order. `order.isReviewed` was the only guard
// before, and it is set in a separate write -- so two submissions racing each
// other both saw `isReviewed: false` and both inserted.
reviewSchema.index({ orderId: 1, user: 1 }, { unique: true });
reviewSchema.index({ restaurantId: 1, createdAt: -1 });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (restaurantId) {
    try {
        // Aggregate all general restaurant reviews
        const generalReviewsObj = await this.aggregate([
            { $match: { restaurantId: restaurantId } },
            {
                $group: {
                    _id: '$restaurantId',
                    totalPoints: { $sum: '$rating' },
                    numReviews: { $sum: 1 }
                }
            }
        ]);

        // Aggregate all item reviews for this restaurant
        // Use mongoose.model to dynamically get ItemReview if it exists, to avoid circular dependencies
        const ItemReviewModel = this.model('ItemReview');
        let itemReviewsObj = [];
        if (ItemReviewModel) {
            itemReviewsObj = await ItemReviewModel.aggregate([
                { $match: { restaurantId: restaurantId } },
                {
                    $group: {
                        _id: '$restaurantId',
                        totalPoints: { $sum: '$rating' },
                        numReviews: { $sum: 1 }
                    }
                }
            ]);
        }

        const generalPoints = generalReviewsObj[0] ? generalReviewsObj[0].totalPoints : 0;
        const generalCount = generalReviewsObj[0] ? generalReviewsObj[0].numReviews : 0;

        const itemPoints = itemReviewsObj[0] ? itemReviewsObj[0].totalPoints : 0;
        const itemCount = itemReviewsObj[0] ? itemReviewsObj[0].numReviews : 0;

        const totalPoints = generalPoints + itemPoints;
        const totalCount = generalCount + itemCount;

        if (totalCount > 0) {
            const overallAverage = totalPoints / totalCount;
            await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
                rating: Math.round(overallAverage * 10) / 10,
                numReviews: totalCount
            });
        } else {
            await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
                rating: 0,
                numReviews: 0
            });
        }
    } catch (err) {
        console.error('Error updating Restaurant rating:', err);
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
