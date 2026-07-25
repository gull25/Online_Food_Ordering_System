const express = require('express');
const {
    createCategory,
    getCategoriesByRestaurant,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');

const router = express.Router();

router.get('/restaurant/:restaurantId', getCategoriesByRestaurant);

// Admin only routes
router.use(protect);
router.use(authorize('restaurant_admin'));

const upload = require('../middlewares/upload.middleware');

router.post('/', upload.single('image'), createCategory);
router.put('/:id', upload.single('image'), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
