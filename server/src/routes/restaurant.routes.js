const express = require("express");
const { z } = require("zod");

const {
    getRestaurants,
    getRestaurantById,
    getRestaurantMenu,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} = require("../controllers/restaurant.controller");
const { protect, optionalAuth } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const { uploadLimiter } = require("../middlewares/rateLimit.middleware");
const { idParam, objectId } = require("../validations/common.validation");
const {
    createRestaurantSchema,
    updateRestaurantSchema,
    createMenuItemSchema,
    updateMenuItemSchema,
    listRestaurantsSchema,
} = require("../validations/restaurant.validation");

const router = express.Router();

const menuIdParam = z.object({ menuId: objectId });
const restaurantImages = upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]);

// ── Public ───────────────────────────────────────────────────────────────────
router.get("/", optionalAuth, validate({ query: listRestaurantsSchema }), getRestaurants);
router.get("/:id", optionalAuth, validate({ params: idParam }), getRestaurantById);
router.get("/:id/menu", optionalAuth, validate({ params: idParam }), getRestaurantMenu);

// ── Owner ────────────────────────────────────────────────────────────────────
router.use(protect, authorize("restaurant_admin"));

/*
 * Order matters: multer must run before `validate`, because the multipart body
 * does not exist until it has been parsed.
 */
router.post("/", uploadLimiter, restaurantImages, validate({ body: createRestaurantSchema }), createRestaurant);

router.put(
    "/:id",
    uploadLimiter,
    restaurantImages,
    validate({ params: idParam, body: updateRestaurantSchema }),
    updateRestaurant,
);

router.delete("/:id", validate({ params: idParam }), deleteRestaurant);

router.post(
    "/:id/menu",
    uploadLimiter,
    upload.single("image"),
    validate({ params: idParam, body: createMenuItemSchema }),
    createMenuItem,
);

router.put(
    "/menu/:menuId",
    uploadLimiter,
    upload.single("image"),
    validate({ params: menuIdParam, body: updateMenuItemSchema }),
    updateMenuItem,
);

router.delete("/menu/:menuId", validate({ params: menuIdParam }), deleteMenuItem);

module.exports = router;
