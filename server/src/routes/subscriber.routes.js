const express = require('express');
const { subscribe, getRecentSubscribers } = require('../controllers/subscriber.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

const router = express.Router();

router.post('/', subscribe);
router.get('/recent', protect, authorize('restaurant_admin', 'admin'), getRecentSubscribers);

module.exports = router;
