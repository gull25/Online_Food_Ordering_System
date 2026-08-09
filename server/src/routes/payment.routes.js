const express = require('express');
const { webhook, easypaisaCallback, jazzcashCallback, verifyStripePayment } = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/webhook', webhook);
router.post('/easypaisa/callback', express.json(), easypaisaCallback);
router.post('/jazzcash/callback', express.json(), jazzcashCallback);
router.post('/verify-stripe', express.json(), protect, verifyStripePayment);

module.exports = router;
