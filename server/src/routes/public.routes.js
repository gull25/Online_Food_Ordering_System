const router = require("express").Router();

const { getTrending, getCollections, validateOffer } = require("../controllers/public.controller");
const validate = require("../middlewares/validate.middleware");
const { promoCodeParam, promoCodeQuery } = require("../validations/catalog.validation");

router.get("/trending", getTrending);
router.get("/collections", getCollections);

router.get(
    "/offers/validate/:code",
    validate({ params: promoCodeParam, query: promoCodeQuery }),
    validateOffer,
);

module.exports = router;
