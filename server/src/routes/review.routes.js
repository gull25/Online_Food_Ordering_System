const router = require("express").Router();
const { z } = require("zod");

const {
    createReview,
    getRestaurantReviews,
    createItemReview,
    getItemReviews,
} = require("../controllers/review.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { objectId, pagination } = require("../validations/common.validation");
const {
    createReviewSchema,
    createItemReviewSchema,
    listReviewsSchema,
} = require("../validations/catalog.validation");

router.get(
    "/restaurant/:restaurantId",
    validate({ params: z.object({ restaurantId: objectId }), query: listReviewsSchema }),
    getRestaurantReviews,
);

router.get(
    "/item/:menuItemId",
    validate({ params: z.object({ menuItemId: objectId }), query: pagination }),
    getItemReviews,
);

router.post("/", protect, validate({ body: createReviewSchema }), createReview);
router.post("/item", protect, validate({ body: createItemReviewSchema }), createItemReview);

module.exports = router;
