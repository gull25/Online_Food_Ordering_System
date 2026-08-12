const router = require("express").Router();

const { subscribe, getRecentSubscribers } = require("../controllers/subscriber.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize, requireRestaurant } = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { strictLimiter } = require("../middlewares/rateLimit.middleware");
const { subscribeSchema } = require("../validations/catalog.validation");

// Rate limited: an open, unauthenticated write endpoint is otherwise a free
// way to fill the collection.
router.post("/", strictLimiter, validate({ body: subscribeSchema }), subscribe);

router.get(
    "/recent",
    protect,
    authorize("restaurant_admin", "admin"),
    requireRestaurant,
    getRecentSubscribers,
);

module.exports = router;
