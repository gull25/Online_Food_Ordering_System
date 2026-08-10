const express = require('express');
const { updateProfile, toggleFavorite } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/favorites/:restaurantId', protect, toggleFavorite);

module.exports = router;
