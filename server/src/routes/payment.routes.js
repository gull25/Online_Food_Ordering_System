const express = require('express');
const { webhook, easypaisaCallback, jazzcashCallback } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/webhook', webhook);
router.post('/easypaisa/callback', express.json(), easypaisaCallback);
router.post('/jazzcash/callback', express.json(), jazzcashCallback);

module.exports = router;
