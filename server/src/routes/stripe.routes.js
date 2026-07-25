const express = require('express');
const { onboardStripe, verifyStripeStatus } = require('../controllers/stripe.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('restaurant_admin')); // Only restaurant admins need to onboard

router.post('/onboard', onboardStripe);
router.get('/verify', verifyStripeStatus);

module.exports = router;
