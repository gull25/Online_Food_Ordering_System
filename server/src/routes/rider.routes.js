const express = require('express');
const router = express.Router();
const riderController = require('../controllers/rider.controller');
const { protect } = require('../middlewares/auth.middleware');

const authorizeRider = (req, res, next) => {
    if (req.user.role !== 'rider') {
        return res.status(403).json({ success: false, message: 'Not authorized to access rider routes' });
    }
    next();
};

router.use(protect);
router.use(authorizeRider);

router.get('/me', riderController.getProfile);
router.get('/dashboard', riderController.getDashboardSummary);
router.get('/active', riderController.getActiveDelivery);
router.put('/status', riderController.updateStatus);
router.put('/pickup/:id', riderController.confirmPickup);
router.put('/deliver/:id', riderController.confirmDelivery);
router.get('/earnings', riderController.getEarnings);
router.get('/performance', riderController.getPerformance);

module.exports = router;
