const orderRepository = require('../repositories/order.repository');
const MenuItem = require('../models/MenuItem');
const Offer = require('../models/Offer');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');

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

        // Single Restaurant Context Enforcement:
        // Ensure all menu items actually belong to the restaurant specified in the order
        const allItemsValid = menuItemsFromDb.every(
            item => item.restaurant.toString() === data.restaurant.toString()
        );
        if (!allItemsValid) {
            throw new ApiError(400, 'Your cart contains items from multiple restaurants. You can only order from one restaurant at a time.');
        }

        // 2. Map items to a dictionary for quick lookup
        const dbItems = {};
        menuItemsFromDb.forEach(item => {
            dbItems[item._id.toString()] = item;
        });

        // 3. Calculate secure subtotal
        let subtotal = 0;
        data.items = data.items.map(cartItem => {
            const dbItem = dbItems[cartItem.menuItem.toString()];
            let securePrice = dbItem.price;

            // Validate and apply size price
            if (cartItem.selectedSize && cartItem.selectedSize.name) {
                const sizeFromDb = dbItem.sizes?.find(s => s.name === cartItem.selectedSize.name);
                if (sizeFromDb) {
                    securePrice += sizeFromDb.additionalPrice;
                    cartItem.selectedSize.additionalPrice = sizeFromDb.additionalPrice; // Override with DB price
                } else {
                    throw new ApiError(400, `Invalid size ${cartItem.selectedSize.name} for item ${dbItem.name}`);
                }
            }

            // Validate and apply add-ons prices
            if (cartItem.selectedAddOns && cartItem.selectedAddOns.length > 0) {
                cartItem.selectedAddOns.forEach(addOn => {
                    const addOnFromDb = dbItem.addOns?.find(a => a.name === addOn.name);
                    if (addOnFromDb) {
                        securePrice += addOnFromDb.price;
                        addOn.price = addOnFromDb.price; // Override with DB price
                    } else {
                         throw new ApiError(400, `Invalid add-on ${addOn.name} for item ${dbItem.name}`);
                    }
                });
            }

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
        if (data.paymentMethod !== 'cash' && data.paymentMethod !== 'cod') {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const amountInCents = Math.round(data.totalAmount * 100);
            
            // Get Restaurant for Stripe Connect
            const restaurant = await Restaurant.findById(data.restaurant);
            if (!restaurant) {
                throw new ApiError(404, 'Restaurant not found');
            }

            const paymentIntentPayload = {
                amount: amountInCents,
                currency: 'usd',
                metadata: {
                    integration_check: 'accept_a_payment'
                }
            };

            // Setup Stripe Connect split payment if onboarded
            if (restaurant.stripeAccountId && restaurant.stripeOnboardingComplete) {
                // Platform fee: 10% of subtotal + $2.50 flat service fee
                const platformFee = (subtotal * 0.10) + serviceFee;
                const platformFeeInCents = Math.round(platformFee * 100);

                // Ensure the platform fee is not greater than the total amount
                const finalFeeInCents = Math.min(platformFeeInCents, amountInCents);

                paymentIntentPayload.application_fee_amount = finalFeeInCents;
                paymentIntentPayload.transfer_data = {
                    destination: restaurant.stripeAccountId
                };
            }

            const paymentIntent = await stripe.paymentIntents.create(paymentIntentPayload);
            
            data.stripePaymentIntentId = paymentIntent.id;
            clientSecret = paymentIntent.client_secret;
        } else {
            data.paymentStatus = 'Unpaid'; 
        }

        const newOrder = await orderRepository.create(data);

        // Update Stripe Payment Intent metadata with the real MongoDB Order ID
        if (data.stripePaymentIntentId) {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
