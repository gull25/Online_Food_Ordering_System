const router = require("express").Router();
const { z } = require("zod");

const riderController = require("../controllers/rider.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { idParam, pagination } = require("../validations/common.validation");

router.use(protect);

/*
 * The bespoke `authorizeRider` guard that lived here returned its own ad-hoc
 * JSON shape and status. Using the shared middleware keeps one error format
 * across the API.
 */
router.use(authorize("rider"));

const statusSchema = z.object({ status: z.enum(["Available", "Busy", "Offline"]) });

router.get("/me", riderController.getProfile);
router.get("/dashboard", riderController.getDashboardSummary);
router.get("/available", riderController.getAvailableDeliveries);
router.get("/active", riderController.getActiveDelivery);
router.get("/history", validate({ query: pagination }), riderController.getDeliveryHistory);
router.get("/earnings", riderController.getEarnings);
router.get("/performance", riderController.getPerformance);

router.put("/status", validate({ body: statusSchema }), riderController.updateStatus);
router.put("/accept/:id", validate({ params: idParam }), riderController.acceptDelivery);
router.put("/pickup/:id", validate({ params: idParam }), riderController.confirmPickup);
router.put("/start/:id", validate({ params: idParam }), riderController.startDelivery);
router.put("/deliver/:id", validate({ params: idParam }), riderController.confirmDelivery);

router.post("/cashout", riderController.cashOut);

module.exports = router;
