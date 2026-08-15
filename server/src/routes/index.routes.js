const router = require("express").Router();

/*
 * Health lives on the app (see app.js) so it sits outside the rate limiter and
 * reports the real database state. The stub that used to be here answered
 * `db: "connected"` unconditionally.
 */

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/restaurants", require("./restaurant.routes"));
router.use("/orders", require("./order.routes"));
router.use("/rider", require("./rider.routes"));
router.use("/public", require("./public.routes"));
router.use("/payments", require("./payment.routes"));
router.use("/stripe", require("./stripe.routes"));
router.use("/reviews", require("./review.routes"));
router.use("/categories", require("./category.routes"));
router.use("/offers", require("./offer.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/subscribers", require("./subscriber.routes"));

module.exports = router;
