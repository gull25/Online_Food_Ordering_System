const express = require('express');
const {
    createReview,
    getRestaurantReviews,
    createItemReview,
    getItemReviews
} = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', protect, createReview);
router.post('/item', protect, createItemReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/item/:menuItemId', getItemReviews);

module.exports = router;
