const router = require("express").Router();

const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { protect } = require("../middlewares/auth.middleware");
const { authLimiter, strictLimiter } = require("../middlewares/rateLimit.middleware");
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
} = require("../validations/auth.validation");

/*
 * Every credential endpoint is rate limited. None of them were before, so login
 * accepted unlimited guesses and forgot-password could be used to send unlimited
 * mail to an arbitrary address.
 */

router.post("/register", authLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);

router.post(
    "/forgot-password",
    strictLimiter,
    validate({ body: forgotPasswordSchema }),
    authController.forgotPassword,
);

router.put(
    "/reset-password/:token",
    authLimiter,
    validate({ params: resetPasswordSchema.params, body: resetPasswordSchema.body }),
    authController.resetPassword,
);

router.put(
    "/change-password",
    protect,
    authLimiter,
    validate({ body: changePasswordSchema }),
    authController.changePassword,
);

router.get("/profile", protect, authController.profile);

module.exports = router;
