const router = require("express").Router();

const {
    getAdminOrders,
    getAdminAnalytics,
    getRiders,
    downloadSalesReport,
} = require("../controllers/admin.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { listOrdersSchema } = require("../validations/order.validation");

router.use(protect);
router.use(authorize("restaurant_admin", "admin"));

/*
 * Scoping to the caller's restaurant happens in the controller (`scopeFor`),
 * not here — a role check alone was what let an owner with no restaurant read
 * the whole platform's orders.
 */
router.get("/orders", validate({ query: listOrdersSchema }), getAdminOrders);
router.get("/analytics", getAdminAnalytics);
router.get("/riders", getRiders);
router.get("/reports/sales", downloadSalesReport);

module.exports = router;
