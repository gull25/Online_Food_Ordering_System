const crypto = require("crypto");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const env = require("../config/env");
const Order = require("../models/order.model");
const Transaction = require("../models/transaction.model");
const Restaurant = require("../models/restaurant.model");
const orderService = require("../services/order.service");
const socketManager = require("../socket");
const sendEmail = require("../utils/sendEmail");
const stripe = require("../config/stripe");

/**
 * Marks an order paid and starts the kitchen workflow.
 *
 * Guarded by a conditional update rather than a read-then-write. The old version
 * checked `order.status === 'PENDING_PAYMENT'` in the caller and then saved, so
 * a Stripe webhook retry arriving while the client's `verify-stripe` call was
 * still in flight could run the body twice — two receipt emails, two order-count
 * increments and two Transaction rows for one payment. `findOneAndUpdate` with
 * the status in the filter makes exactly one caller win.
 */
const confirmOrderPayment = async (orderId, gateway, transactionId, rawResponse) => {
    const order = await Order.findOneAndUpdate(
        { _id: orderId, status: "PENDING_PAYMENT" },
        {
            $set: { paymentStatus: "PAID", status: "PLACED", gatewayTransactionId: transactionId },
            $push: { statusHistory: { status: "PLACED", timestamp: new Date() } },
        },
        { new: true },
    ).populate("user", "email name");

    // Already confirmed by a concurrent call, or never awaiting payment.
    if (!order) return null;

    try {
        await Transaction.create({
            orderId: order._id,
            gateway,
            transactionId,
            amount: order.totalAmount,
            currency: "USD",
            status: "Success",
            rawResponse,
        });
    } catch (error) {
        // The unique (gateway, transactionId) index makes a redelivered webhook
        // a duplicate-key error rather than a second ledger row. The payment is
        // already recorded, so this is the success path.
        if (error.code !== 11000) throw error;
    }

    await orderService.recordOrderPlaced(order);

    // Receipt and customer notification are best-effort: a mail outage must not
    // roll back a captured payment.
    if (order.user?.email) {
        try {
            await sendEmail({
                email: order.user.email,
                subject: "Your Foodora order receipt",
                message: `Thanks for your order. Payment of $${order.totalAmount.toFixed(2)} was successful. Order ID: ${order._id}`,
                html: `
                    <h1>Order receipt</h1>
                    <p>Hi ${order.user.name},</p>
                    <p>Your payment of <strong>$${order.totalAmount.toFixed(2)}</strong> was successful.</p>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p>Your food is now being prepared — you can follow it live in the app.</p>
                `,
            });
        } catch (error) {
            console.error("[Payments] Receipt email failed:", error.message);
        }
    }

    try {
        socketManager.emitToUser(String(order.user?._id ?? order.user), "orderStatusUpdate", order);
    } catch (error) {
        console.error("[Payments] Customer notification failed:", error.message);
    }

    return order;
};

// @desc    Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public (signature verified)
exports.webhook = asyncHandler(async (req, res) => {
    if (!env.STRIPE_WEBHOOK_SECRET) {
        // Without the secret there is no way to tell Stripe apart from anyone
        // else posting to this URL, so the only safe behaviour is to refuse.
        console.error("[Payments] Webhook received but STRIPE_WEBHOOK_SECRET is not configured");
        return res.status(503).json({ received: false });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"],
            env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (error) {
        console.error(`[Payments] Webhook signature verification failed: ${error.message}`);
        return res.status(400).json({ received: false, message: "Invalid signature" });
    }

    switch (event.type) {
        case "payment_intent.succeeded": {
            const intent = event.data.object;
            if (intent.metadata?.orderId) {
                await confirmOrderPayment(intent.metadata.orderId, "stripe", intent.id, intent);
            }
            break;
        }

        /*
         * Previously unhandled, so a declined card left the order stuck at
         * PENDING_PAYMENT forever — invisible to the restaurant and undismissable
         * by the customer.
         */
        case "payment_intent.payment_failed": {
            const intent = event.data.object;
            if (intent.metadata?.orderId) {
                await Order.findOneAndUpdate(
                    { _id: intent.metadata.orderId, status: "PENDING_PAYMENT" },
                    {
                        $set: { status: "PAYMENT_FAILED", paymentStatus: "FAILED" },
                        $push: { statusHistory: { status: "PAYMENT_FAILED", timestamp: new Date() } },
                    },
                );
            }
            break;
        }

        default:
            break;
    }

    // Stripe only needs a 2xx; anything else triggers redelivery.
    res.json({ received: true });
});

/*
 * Wallet callbacks.
 *
 * These endpoints are unauthenticated by nature — the gateway calls them, not the
 * user. Previously they took an `orderId` and a `status` string from the request
 * body at face value and marked the order PAID, so
 *
 *     POST /api/payments/easypaisa/callback
 *     { "orderId": "<any id>", "status": "SUCCESS" }
 *
 * from anyone on the internet confirmed any pending order without a payment ever
 * being made. Both gateways sign their callbacks; verifying that signature is the
 * only thing that makes the endpoint meaningful, so a missing shared secret is
 * now a hard failure rather than an implicit "trust the caller".
 */
const verifySignature = (payload, providedSignature, secret) => {
    if (!providedSignature || typeof providedSignature !== "string") return false;

    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const provided = providedSignature.toLowerCase();

    // Constant-time compare — a plain `===` leaks the correct prefix through
    // response timing, letting a signature be recovered byte by byte.
    if (expected.length !== provided.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
};

const walletCallback = ({ secret, gatewayName, extract }) =>
    asyncHandler(async (req, res) => {
        if (!secret) {
            console.error(`[Payments] ${gatewayName} callback received but no shared secret is configured`);
            throw new ApiError(503, `${gatewayName} payments are not configured`);
        }

        const { orderId, transactionId, signature, succeeded } = extract(req.body);

        if (!orderId || !transactionId) {
            throw new ApiError(400, "Malformed callback payload");
        }

        // The gateway signs the fields it echoes back, so the signature must
        // cover the order and transaction this call claims to be about.
        if (!verifySignature(`${orderId}:${transactionId}`, signature, secret)) {
            console.warn(`[Payments] Rejected ${gatewayName} callback with an invalid signature`);
            throw new ApiError(401, "Invalid callback signature");
        }

        if (!succeeded) {
            await Order.findOneAndUpdate(
                { _id: orderId, status: "PENDING_PAYMENT" },
                {
                    $set: { status: "PAYMENT_FAILED", paymentStatus: "FAILED" },
                    $push: { statusHistory: { status: "PAYMENT_FAILED", timestamp: new Date() } },
                },
            );
            return res.status(200).json({ success: true, message: "Failure recorded" });
        }

        const order = await confirmOrderPayment(orderId, gatewayName.toLowerCase(), transactionId, req.body);

        return res.status(200).json({
            success: true,
            message: order ? "Order confirmed" : "Already processed",
        });
    });

exports.easypaisaCallback = walletCallback({
    secret: env.EASYPAISA_HASH_KEY,
    gatewayName: "Easypaisa",
    extract: (body) => ({
        orderId: body.orderId,
        transactionId: body.transactionId,
        signature: body.signature ?? body.hash,
        succeeded: body.status === "SUCCESS",
    }),
});

exports.jazzcashCallback = walletCallback({
    secret: env.JAZZCASH_INTEGRITY_SALT,
    gatewayName: "JazzCash",
    extract: (body) => ({
        orderId: body.orderId,
        transactionId: body.pp_TxnRefNo,
        signature: body.pp_SecureHash,
        succeeded: body.pp_ResponseCode === "000",
    }),
});

// @desc    Confirm a Stripe payment from the client after the modal closes
// @route   POST /api/payments/verify-stripe
// @access  Private (order owner)
exports.verifyStripePayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).select("user status stripePaymentIntentId").lean();
    if (!order) throw new ApiError(404, "Order not found");

    // The endpoint was protected but never checked *whose* order it was. It
    // reveals order status and triggers a receipt email, so it needs the same
    // ownership check as reading the order does.
    if (order.user.toString() !== req.user.id) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status !== "PENDING_PAYMENT") {
        return res.json({ success: true, message: "Order already processed", status: order.status });
    }

    if (!order.stripePaymentIntentId) {
        throw new ApiError(400, "This order was not paid by card");
    }

    const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

    if (intent.status !== "succeeded") {
        return res.status(402).json({
            success: false,
            message: "Payment has not completed yet",
            status: intent.status,
        });
    }

    const confirmed = await confirmOrderPayment(order._id, "stripe", intent.id, intent);

    res.json({
        success: true,
        message: "Payment verified",
        status: confirmed?.status ?? "PLACED",
    });
});

exports.confirmOrderPayment = confirmOrderPayment;
