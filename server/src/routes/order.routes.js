const router = require("express").Router();

const {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    assignRider,
} = require("../controllers/order.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/authorize.middleware");
const validate = require("../middlewares/validate.middleware");
const { orderLimiter } = require("../middlewares/rateLimit.middleware");
const {
    createOrderSchema,
    updateStatusSchema,
    assignRiderSchema,
    listOrdersSchema,
} = require("../validations/order.validation");
const { idParam } = require("../validations/common.validation");

router.use(protect);

router.post("/", orderLimiter, validate({ body: createOrderSchema }), createOrder);

router.get("/my-orders", validate({ query: listOrdersSchema }), getMyOrders);

router.get("/:id", validate({ params: idParam }), getOrderById);

/*
 * Ownership is enforced in the service (a customer may only cancel their own
 * order, a restaurant only its own, a rider only their assigned delivery). The
 * role list here is the coarse filter; it is not, by itself, authorisation.
 */
router.put(
    "/:id/status",
    authorize("restaurant_admin", "rider", "customer", "admin"),
    validate({ params: updateStatusSchema.params, body: updateStatusSchema.body }),
    updateOrderStatus,
);

router.put(
    "/:id/rider",
    // No `requireRestaurant` here: platform admins legitimately have no
    // restaurant of their own, and the service already scopes owners to theirs.
    authorize("restaurant_admin", "admin"),
    validate({ params: assignRiderSchema.params, body: assignRiderSchema.body }),
    assignRider,
);

module.exports = router;
