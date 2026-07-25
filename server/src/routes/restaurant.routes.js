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
const { protect, optionalAuth } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

const router = express.Router();

router.get('/', optionalAuth, getRestaurants);
router.get('/:id', optionalAuth, getRestaurantById);
router.get('/:id/menu', optionalAuth, getRestaurantMenu);

const upload = require('../middlewares/upload.middleware');

// Protected admin routes
router.post('/', protect, authorize('restaurant_admin'), upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), createRestaurant);

router.put('/:id', protect, authorize('restaurant_admin'), upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), updateRestaurant);

router.delete('/:id', protect, authorize('restaurant_admin'), deleteRestaurant);

router.post('/:id/menu', protect, authorize('restaurant_admin'), upload.single('image'), createMenuItem);
router.put('/menu/:menuId', protect, authorize('restaurant_admin'), upload.single('image'), updateMenuItem);
router.delete('/menu/:menuId', protect, authorize('restaurant_admin'), deleteMenuItem);

module.exports = router;
