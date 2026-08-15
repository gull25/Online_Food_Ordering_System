const router = require("express").Router();
const { z } = require("zod");

const { updateProfile, toggleFavorite, getFavorites } = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const upload = require("../middlewares/upload.middleware");
const { uploadLimiter } = require("../middlewares/rateLimit.middleware");
const { objectId } = require("../validations/common.validation");
const { updateProfileSchema } = require("../validations/catalog.validation");

router.use(protect);

router.put(
    "/profile",
    uploadLimiter,
    upload.single("avatar"),
    validate({ body: updateProfileSchema }),
    updateProfile,
);

router.get("/favorites", getFavorites);

router.put(
    "/favorites/:restaurantId",
    validate({ params: z.object({ restaurantId: objectId }) }),
    toggleFavorite,
);

module.exports = router;
