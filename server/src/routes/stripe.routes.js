const router = require("express").Router();

const { onboardStripe, verifyStripeStatus } = require("../controllers/stripe.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize, requireRestaurant } = require("../middlewares/authorize.middleware");

router.use(protect);
router.use(authorize("restaurant_admin"));

// Both handlers previously opened with `if (!req.user.restaurantId)`; doing it
// once here keeps the controllers to their actual job.
router.use(requireRestaurant);

router.post("/onboard", onboardStripe);
router.get("/verify", verifyStripeStatus);

module.exports = router;
