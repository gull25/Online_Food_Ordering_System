const express = require('express');
const { webhook } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/webhook', webhook);

module.exports = router;
