const asyncHandler = require('../utils/asyncHandler');
const Order = require('../models/Order');
const socketManager = require('../socket');
const sendEmail = require('../utils/sendEmail');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Stripe Webhook Endpoint
// @route   POST /api/payments/webhook
// @access  Public
exports.webhook = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // req.body is the raw buffer thanks to express.raw() in app.js
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // We attached orderId in the metadata during createOrder
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
            const order = await Order.findById(orderId).populate('user', 'email name');
            if (order) {
                order.paymentStatus = 'Paid';
                order.status = 'Preparing'; 
                await order.save();
                console.log(`Payment confirmed and Order ${orderId} updated successfully.`);

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
                        console.log('Receipt email sent.');
                    } catch (err) {
                        console.error('Failed to send receipt email:', err);
                    }
                }

                try {
                    const customerSocketId = socketManager.getSocketIdByUserId(order.user._id || order.user);
                    if (customerSocketId) {
                        const io = socketManager.getIo();
                        io.to(customerSocketId).emit('orderStatusUpdate', order);
                    }
                } catch (error) {
                    console.error('Socket emission failed in webhook:', error);
                }
            }
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
});
