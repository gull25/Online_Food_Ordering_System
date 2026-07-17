const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/profile', protect, (req, res) => {
    res.json({
        success: true,
        user: req.user,
    });
});

module.exports = router;
