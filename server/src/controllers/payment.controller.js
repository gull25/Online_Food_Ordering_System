const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/order.model');
const Transaction = require('../models/transaction.model');
const MenuItem = require('../models/menuItem.model');
const Restaurant = require('../models/restaurant.model');
const socketManager = require('../socket');
const sendEmail = require('../utils/sendEmail');

const stripe = require('../config/stripe');

// Helper to confirm order, save transaction, update counts, and notify restaurant
const confirmOrderPayment = async (order, gateway, transactionId, rawResponse) => {
    order.paymentStatus = 'PAID';
    order.status = 'PLACED'; // Now it enters the restaurant's workflow
    order.gatewayTransactionId = transactionId;
    order.statusHistory.push({ status: 'PLACED', timestamp: new Date() });
    await order.save();

    // Log Transaction
    await Transaction.create({
        orderId: order._id,
        gateway: gateway,
        transactionId: transactionId,
        amount: order.totalAmount,
        status: 'Success',
        rawResponse
    });

    // Increment orderCount for each menu item (Popularity)
    try {
        for (const cartItem of order.items) {
            await MenuItem.findByIdAndUpdate(cartItem.menuItem, {
                $inc: { orderCount: cartItem.quantity }
            });
        }
    } catch (err) {
        console.error('[PaymentController] Failed to increment order counts:', err.message);
    }

    console.log(`Payment confirmed and Order ${order._id} updated successfully via ${gateway}.`);

    // Send Email Receipt
    if (order.user && order.user.email) {
        try {
            const receiptHtml = `
                <h1>Order Receipt</h1>
                <p>Hi ${order.user.name},</p>
                <p>Thank you for your order! Your payment of $${order.totalAmount.toFixed(2)} was successful.</p>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p>Your food is now being prepared. You can track your order on our website.</p>
            `;
            await sendEmail({
                email: order.user.email,
                subject: 'Your Foodora Order Receipt',
                html: receiptHtml
            });
        } catch (err) {
            console.error('Failed to send receipt email:', err);
        }
    }

    // Notify Customer
    try {
        const customerSocketId = socketManager.getSocketIdByUserId(order.user._id || order.user);
        if (customerSocketId) {
            socketManager.getIo().to(customerSocketId).emit('orderStatusUpdate', order);
        }
    } catch (error) {
        console.error('Customer socket emission failed:', error);
    }

    // Notify Restaurant
    try {
        const populatedRestaurant = await Restaurant.findById(order.restaurant).select('owner');
        if (populatedRestaurant?.owner) {
            socketManager.emitToUser(
                populatedRestaurant.owner.toString(),
                'order:new',
                { order: order }
            );
        }
    } catch (err) {
        console.error('Restaurant socket emission failed:', err.message);
    }
};


exports.webhook = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
            const order = await Order.findById(orderId).populate('user', 'email name');
            if (order && order.status === 'PENDING_PAYMENT') {
                await confirmOrderPayment(order, 'stripe', paymentIntent.id, paymentIntent);
            }
        }
    }

    res.json({ received: true });
});

exports.easypaisaCallback = asyncHandler(async (req, res, next) => {
    const { orderId, transactionId, status, responseCode } = req.body;

    // Security: Verify hash/signature from Easypaisa here in production

    if (orderId && status === 'SUCCESS') {
        const order = await Order.findById(orderId).populate('user', 'email name');
        if (order && order.status === 'PENDING_PAYMENT') {
            await confirmOrderPayment(order, 'easypaisa', transactionId, req.body);
            return res.json({ success: true, message: 'Order confirmed' });
        }
    }

    res.status(400).json({ success: false, message: 'Invalid or failed transaction' });
});

exports.jazzcashCallback = asyncHandler(async (req, res, next) => {
    const { orderId, pp_TxnRefNo, pp_ResponseCode } = req.body;

    // Security: Verify pp_SecureHash from JazzCash here in production

    if (orderId && pp_ResponseCode === '000') { // 000 means success in JazzCash
        const order = await Order.findById(orderId).populate('user', 'email name');
        if (order && order.status === 'PENDING_PAYMENT') {
            await confirmOrderPayment(order, 'jazzcash', pp_TxnRefNo, req.body);
            return res.json({ success: true, message: 'Order confirmed' });
        }
    }

    res.status(400).json({ success: false, message: 'Invalid or failed transaction' });
});
