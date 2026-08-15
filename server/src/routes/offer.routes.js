const router = require("express").Router();
const { z } = require("zod");

const {
    createOffer,
    getMyOffers,
    updateOffer,
    deleteOffer,
    getActiveOffers,
} = require("../controllers/offer.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize, requireRestaurant } = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const { uploadLimiter } = require("../middlewares/rateLimit.middleware");
const { idParam, objectId } = require("../validations/common.validation");
const { createOfferSchema, updateOfferSchema } = require("../validations/catalog.validation");

router.get(
    "/active",
    validate({ query: z.object({ restaurantId: objectId.optional() }) }),
    getActiveOffers,
);

router.use(protect, authorize("restaurant_admin", "admin"), requireRestaurant);

router.get("/mine", getMyOffers);

/*
 * Kept as an alias of /mine so existing clients keep working. The path parameter
 * is ignored deliberately: the previous handler compared it against the caller's
 * own restaurant and rejected anything else, so it could only ever be the
 * caller's id — an input that exists only to be validated against the session is
 * better read from the session.
 */
router.get("/restaurant/:restaurantId", getMyOffers);

router.post("/", uploadLimiter, upload.single("image"), validate({ body: createOfferSchema }), createOffer);

router.put(
    "/:id",
    uploadLimiter,
    upload.single("image"),
    validate({ params: idParam, body: updateOfferSchema }),
    updateOffer,
);

router.delete("/:id", validate({ params: idParam }), deleteOffer);

module.exports = router;
