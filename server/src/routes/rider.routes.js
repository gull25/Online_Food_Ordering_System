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
router.get('/available', riderController.getAvailableDeliveries);
router.get('/active', riderController.getActiveDelivery);
router.get('/history', riderController.getDeliveryHistory);
router.put('/status', riderController.updateStatus);
router.put('/accept/:id', riderController.acceptDelivery);
router.put('/pickup/:id', riderController.confirmPickup);
router.put('/start/:id', riderController.startDelivery);
router.put('/deliver/:id', riderController.confirmDelivery);
router.get('/earnings', riderController.getEarnings);
router.post('/cashout', riderController.cashOut);
router.get('/performance', riderController.getPerformance);

module.exports = router;
