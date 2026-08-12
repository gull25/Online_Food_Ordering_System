const express = require("express");
const { z } = require("zod");

const {
    webhook,
    easypaisaCallback,
    jazzcashCallback,
    verifyStripePayment,
} = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { objectId } = require("../validations/common.validation");

const router = express.Router();

/*
 * The raw body parser for this path is mounted in app.js, before express.json,
 * because Stripe verifies a signature over the exact bytes it sent.
 */
router.post("/webhook", webhook);

// Gateway-to-server callbacks. Signature-verified in the controller.
router.post("/easypaisa/callback", express.json(), easypaisaCallback);
router.post("/jazzcash/callback", express.json(), jazzcashCallback);

router.post(
    "/verify-stripe",
    protect,
    validate({ body: z.object({ orderId: objectId }) }),
    verifyStripePayment,
);

module.exports = router;
