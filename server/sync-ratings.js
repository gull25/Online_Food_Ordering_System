require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./src/models/restaurant.model');
const Review = require('./src/models/review.model');
const ItemReview = require('./src/models/itemReview.model');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to DB');
    const restaurants = await Restaurant.find({});
    for (const r of restaurants) {
        console.log(`Resetting ratings for: ${r.name}`);
        await Review.getAverageRating(r._id);
    }
    console.log('All restaurant ratings have been synchronized with actual reviews (which is 0 right now).');
    process.exit(0);
}).catch(console.error);
