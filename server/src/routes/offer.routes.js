const express = require('express');
const {
    createOffer,
    getOffersByRestaurant,
    updateOffer,
    deleteOffer,
    getActiveOffers
} = require('../controllers/offer.controller');

const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Public routes
router.get('/active', getActiveOffers);

// Protected routes (Admin / Restaurant Admin)
router.use(protect);
router.use(authorize('restaurant_admin', 'admin'));

router.route('/')
    .post(upload.single('image'), createOffer); 

router.route('/restaurant/:restaurantId')
    .get(getOffersByRestaurant);

router.route('/:id')
    .put(upload.single('image'), updateOffer) 
    .delete(deleteOffer);

module.exports = router;
