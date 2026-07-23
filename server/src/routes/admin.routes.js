const express = require('express');
const { getAllOrders, getAnalytics } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/orders', getAllOrders);
router.get('/analytics', getAnalytics);

module.exports = router;
