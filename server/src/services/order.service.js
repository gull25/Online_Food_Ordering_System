const orderRepository = require('../repositories/order.repository');
const MenuItem = require('../models/MenuItem');
const Offer = require('../models/Offer');
const ApiError = require('../utils/ApiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const socketManager = require('../socket');

class OrderService {
    async createOrder(data) {
        if (!data.items || data.items.length === 0) {
            throw new ApiError(400, 'Order must contain items');
        }

        // 1. Fetch real prices from the DB
        const itemIds = data.items.map(item => item.menuItem);
        const menuItemsFromDb = await MenuItem.find({ _id: { $in: itemIds } });

        if (menuItemsFromDb.length !== itemIds.length) {
            throw new ApiError(400, 'One or more items in your cart are invalid or no longer exist.');
        }

        // 2. Map prices to a dictionary for quick lookup
        const dbPrices = {};
        menuItemsFromDb.forEach(item => {
            dbPrices[item._id.toString()] = item.price;
        });

        // 3. Calculate secure subtotal
        let subtotal = 0;
        data.items = data.items.map(cartItem => {
            const securePrice = dbPrices[cartItem.menuItem.toString()];
            subtotal += securePrice * cartItem.quantity;
            // Overwrite frontend price with DB price
            return {
                ...cartItem,
                price: securePrice
            };
        });

        // 4. Apply Promo Codes
        let discountPercent = 0;
        if (data.promoCode) {
            const code = data.promoCode.trim().toUpperCase();
            const offer = await Offer.findOne({ 
                code: code, 
                isActive: true,
                validUntil: { $gte: new Date() }
            });

            if (offer) {
                discountPercent = offer.discountPercentage;
            } else {
                throw new ApiError(400, 'Invalid or expired promo code');
            }
        }

        const discountAmount = subtotal * (discountPercent / 100);
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const tax = taxableAmount * 0.087; // 8.7%
        const serviceFee = subtotal > 0 ? 2.50 : 0;
        const calculatedTotal = subtotal - discountAmount + tax + serviceFee;

        data.subtotal = subtotal;
        data.discountAmount = discountAmount;
        data.tax = tax;
        data.serviceFee = serviceFee;
        data.totalAmount = Math.max(0, calculatedTotal);

        // 5. Generate Payment Intent (Stripe Live)
        let clientSecret = null;
        if (data.paymentMethod !== 'cash') {
            // Amount is in cents for Stripe!
            const amountInCents = Math.round(data.totalAmount * 100);
            
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                // Temporarily leave orderId blank or generic until we save the DB record, 
                // but actually, we can add it later via stripe.paymentIntents.update
                // or just rely on the fact that we'll save the paymentIntent.id to MongoDB immediately.
                metadata: {
                    integration_check: 'accept_a_payment'
                }
            });
            
            data.stripePaymentIntentId = paymentIntent.id;
            clientSecret = paymentIntent.client_secret;
        } else {
            data.paymentStatus = 'Unpaid'; 
        }

        const newOrder = await orderRepository.create(data);

        // Update Stripe Payment Intent metadata with the real MongoDB Order ID
        if (data.stripePaymentIntentId) {
            await stripe.paymentIntents.update(data.stripePaymentIntentId, {
                metadata: {
                    orderId: newOrder._id.toString()
                }
            });
        }

        // Return order with clientSecret so frontend can mount Stripe Elements
        return {
            order: newOrder,
            clientSecret
        };
    }

    async getMyOrders(userId) {
        return await orderRepository.findByUser(userId);
    }

    async getAllOrders() {
        return await orderRepository.findAll();
    }

    async getOrderById(orderId, userId, role) {
        const order = await orderRepository.findById(orderId);
        
        if (!order) {
            throw new ApiError(404, 'Order not found');
        }

        // Only the user who placed the order or an admin can view it
        if (order.user.toString() !== userId.toString() && role !== 'admin' && role !== 'super_admin') {
            throw new ApiError(403, 'Not authorized to access this order');
        }

        return order;
    }

    async updateOrderStatus(orderId, status) {
        const order = await orderRepository.updateStatus(orderId, status);
        if (!order) {
            throw new ApiError(404, 'Order not found');
        }
        return order;
    }
}

module.exports = new OrderService();
