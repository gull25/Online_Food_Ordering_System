const mongoose = require('mongoose');

const itemReviewSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
        index: true
    },
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

// Prevent multiple reviews from the same user on the same order item
itemReviewSchema.index({ orderId: 1, menuItemId: 1, user: 1 }, { unique: true });
// Backs the paginated listings, which sort by recency.
itemReviewSchema.index({ menuItemId: 1, createdAt: -1 });
itemReviewSchema.index({ restaurantId: 1, createdAt: -1 });

// Static method to get avg rating and save
itemReviewSchema.statics.getAverageRating = async function (menuItemId, restaurantId) {
    // 1. Calculate and update MenuItem rating
    const itemObj = await this.aggregate([
        {
            $match: { menuItemId: menuItemId }
        },
        {
            $group: {
                _id: '$menuItemId',
                averageRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        if (itemObj[0]) {
            await this.model('MenuItem').findByIdAndUpdate(menuItemId, {
                rating: Math.round(itemObj[0].averageRating * 10) / 10,
                numReviews: itemObj[0].numReviews
            });
        } else {
            await this.model('MenuItem').findByIdAndUpdate(menuItemId, {
                rating: 0,
                numReviews: 0
            });
        }
    } catch (err) {
        console.error('Error updating MenuItem rating:', err);
    }

    // 2. Calculate and update overall Restaurant rating
    try {
        // Aggregate all general restaurant reviews
        const generalReviewsObj = await this.model('Review').aggregate([
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
        const itemReviewsObj = await this.aggregate([
            { $match: { restaurantId: restaurantId } },
            {
                $group: {
                    _id: '$restaurantId',
                    totalPoints: { $sum: '$rating' },
                    numReviews: { $sum: 1 }
                }
            }
        ]);

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
itemReviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.menuItemId, this.restaurantId);
});

// Call getAverageRating after remove
itemReviewSchema.post('remove', async function () {
    await this.constructor.getAverageRating(this.menuItemId, this.restaurantId);
});

module.exports = mongoose.model('ItemReview', itemReviewSchema);
