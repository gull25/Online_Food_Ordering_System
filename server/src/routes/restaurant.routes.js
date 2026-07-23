const express = require('express');
const {
    getRestaurants,
    getRestaurantById,
    getRestaurantMenu,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/restaurant.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);

// Admin routes
router.post('/', protect, authorize('admin', 'super_admin'), createRestaurant);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateRestaurant);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteRestaurant);

router.post('/:id/menu', protect, authorize('admin', 'super_admin'), createMenuItem);
router.put('/menu/:menuId', protect, authorize('admin', 'super_admin'), updateMenuItem);
router.delete('/menu/:menuId', protect, authorize('admin', 'super_admin'), deleteMenuItem);

module.exports = router;
