const { z } = require("zod");
const { objectId, phone, safeText, pagination } = require("./common.validation");

/*
 * The order body used to be forwarded to `Order.create()` untouched. That let a
 * client set `status`, `paymentStatus`, `riderEarning`, `rider`,
 * `gatewayTransactionId` and `totalAmount` directly — placing an order already
 * marked PAID, or crediting themselves as the delivering rider.
 *
 * This schema is the allowlist: only what a customer legitimately chooses. Every
 * monetary field is recomputed from the database in the service layer, so prices
 * are simply not accepted from the client at all.
 */

/*
 * Both `cash` and `cod` mean cash on delivery.
 *
 * The service reads `paymentMethod === 'cash' ? 'cod' : paymentMethod`, while
 * the checkout screen has always sent the string `'cod'`. That happened to work
 * — `'cod'` fell through the ternary unchanged and `'cod'` is a valid gateway —
 * so the mismatch was invisible until this list started rejecting anything not
 * on it. Both spellings are accepted and normalised below rather than changing
 * one side and silently breaking every stored order that used the other.
 */
const PAYMENT_METHODS = ["cash", "cod", "stripe", "easypaisa", "jazzcash", "meezan", "ubl"];

const orderItemSchema = z.object({
    menuItem: objectId,
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(50, "Maximum 50 of one item"),
    selectedSize: z
        .object({ name: safeText(60, "Size name").pipe(z.string().min(1)) })
        .nullish()
        .transform((value) => value ?? undefined),
    selectedAddOns: z
        .array(z.object({ name: safeText(60, "Add-on name").pipe(z.string().min(1)) }))
        .max(20, "Too many add-ons")
        .optional()
        .default([]),
});

const deliveryAddressSchema = z.object({
    firstName: safeText(50, "First name").pipe(z.string().min(1, "First name is required")),
    lastName: safeText(50, "Last name").pipe(z.string().min(1, "Last name is required")),
    phone,
    city: safeText(80, "City").pipe(z.string().min(1, "City is required")),
    streetAddress: safeText(200, "Street address").pipe(z.string().min(5, "Please enter a full street address")),
    instructions: safeText(300, "Instructions").optional(),
});

const createOrderSchema = z.object({
    restaurant: objectId,
    items: z.array(orderItemSchema).min(1, "Your cart is empty").max(50, "Too many items in one order"),
    deliveryAddress: deliveryAddressSchema,
    paymentMethod: z.enum(PAYMENT_METHODS, { message: "Unsupported payment method" }),
    promoCode: safeText(40, "Promo code")
        .transform((value) => value.toUpperCase())
        .optional(),
    // Client-generated so a retried request after a dropped response cannot
    // create a second order. A UUID shape is enforced to keep the unique index
    // meaningful.
    idempotencyKey: z.string().trim().min(8).max(64).optional(),
});

const CUSTOMER_STATUSES = ["CANCELLED"];
const RESTAURANT_STATUSES = ["ACCEPTED", "REJECTED", "PREPARING", "READY_FOR_PICKUP", "CANCELLED"];
const RIDER_STATUSES = ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];

const ALL_TRANSITIONABLE = Array.from(
    new Set([...CUSTOMER_STATUSES, ...RESTAURANT_STATUSES, ...RIDER_STATUSES]),
);

const updateStatusSchema = {
    params: z.object({ id: objectId }),
    body: z.object({
        status: z.enum(ALL_TRANSITIONABLE, { message: "Unsupported order status" }),
        rejectionReason: safeText(300, "Reason").optional(),
        // `cancelledBy`, `rider`, `estimatedDeliveryTime` and every other
        // side-channel the old handler accepted are derived server-side now.
    }),
};

const assignRiderSchema = {
    params: z.object({ id: objectId }),
    body: z.object({ riderId: objectId }),
};

const listOrdersSchema = pagination.extend({
    status: z.string().trim().max(30).optional(),
});

module.exports = {
    createOrderSchema,
    updateStatusSchema,
    assignRiderSchema,
    listOrdersSchema,
    PAYMENT_METHODS,
    CUSTOMER_STATUSES,
    RESTAURANT_STATUSES,
    RIDER_STATUSES,
};
