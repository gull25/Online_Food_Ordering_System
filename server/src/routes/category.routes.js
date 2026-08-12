const router = require("express").Router();
const { z } = require("zod");

const {
    createCategory,
    getCategoriesByRestaurant,
    updateCategory,
    deleteCategory,
} = require("../controllers/category.controller");
const { protect, optionalAuth } = require("../middlewares/auth.middleware");
const { authorize, requireRestaurant } = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const { uploadLimiter } = require("../middlewares/rateLimit.middleware");
const { idParam, objectId } = require("../validations/common.validation");
const { createCategorySchema, updateCategorySchema } = require("../validations/catalog.validation");

// `optionalAuth` so the owning restaurant also sees deactivated categories.
router.get(
    "/restaurant/:restaurantId",
    optionalAuth,
    validate({ params: z.object({ restaurantId: objectId }) }),
    getCategoriesByRestaurant,
);

router.use(protect, authorize("restaurant_admin"), requireRestaurant);

router.post(
    "/",
    uploadLimiter,
    upload.single("image"),
    validate({ body: createCategorySchema }),
    createCategory,
);

router.put(
    "/:id",
    uploadLimiter,
    upload.single("image"),
    validate({ params: idParam, body: updateCategorySchema }),
    updateCategory,
);

router.delete("/:id", validate({ params: idParam }), deleteCategory);

module.exports = router;
