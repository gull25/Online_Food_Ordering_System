const express = require('express');
const { getAdminOrders, getAdminAnalytics, getRiders, downloadSalesReport } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

const router = express.Router();

// Apply auth middlewares to all routes below
router.use(protect);
router.use(authorize('restaurant_admin', 'admin'));

router.get('/orders', getAdminOrders);
router.get('/analytics', getAdminAnalytics);
router.get('/riders', getRiders);
router.get('/reports/sales', downloadSalesReport);

module.exports = router;
