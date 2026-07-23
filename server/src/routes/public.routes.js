const express = require('express');
const { getTrending, getCollections, validateOffer } = require('../controllers/public.controller');

const router = express.Router();

router.get('/trending', getTrending);
router.get('/collections', getCollections);
router.get('/offers/validate/:code', validateOffer);

module.exports = router;
