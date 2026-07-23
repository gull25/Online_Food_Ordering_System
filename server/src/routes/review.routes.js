const express = require('express');
const {
    createReview,
    getRestaurantReviews
} = require('../controllers/review.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);

module.exports = router;
