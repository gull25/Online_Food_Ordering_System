const express = require('express');
const { updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.put('/profile', protect, updateProfile);

module.exports = router;
