const orderRepository = require('../repositories/order.repository');
const MenuItem = require('../models/menuItem.model');
const Offer = require('../models/offer.model');
const Restaurant = require('../models/restaurant.model');
const ApiError = require('../utils/ApiError');
const { geocodeAddress } = require('../utils/geocoder');

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
            const code = data.promoCode.trim();
            const offer = await Offer.findOne({
                code: new RegExp(`^${code}$`, 'i'),
                isActive: true,
                validUntil: { $gte: new Date() },
                restaurantId: data.restaurant
            });

            if (offer) {
                discountPercent = offer.discountPercentage;
            } else {
                throw new ApiError(400, 'Invalid, expired, or inapplicable promo code');
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

        // 5. Setup Payment Gateway
        let clientSecret = null;
        let paymentUrl = null;
        data.paymentGateway = data.paymentMethod === 'cash' ? 'cod' : data.paymentMethod;

        if (data.paymentGateway === 'stripe') {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const amountInCents = Math.round(data.totalAmount * 100);

            const restaurant = await Restaurant.findById(data.restaurant);
            if (!restaurant) throw new ApiError(404, 'Restaurant not found');

            const customer = await stripe.customers.create();
            const paymentIntentPayload = {
                amount: amountInCents,
                currency: 'usd',
                customer: customer.id,
                payment_method_types: ['card'],
                metadata: { integration_check: 'accept_a_payment' }
            };

            if (restaurant.stripeAccountId && restaurant.stripeOnboardingComplete) {
                const platformFee = (subtotal * 0.10) + serviceFee;
                const finalFeeInCents = Math.min(Math.round(platformFee * 100), amountInCents);

                paymentIntentPayload.application_fee_amount = finalFeeInCents;
                paymentIntentPayload.transfer_data = { destination: restaurant.stripeAccountId };
            }

            const paymentIntent = await stripe.paymentIntents.create(paymentIntentPayload);
            data.stripePaymentIntentId = paymentIntent.id;
            clientSecret = paymentIntent.client_secret;
            data.paymentStatus = 'PENDING';
            data.status = 'PENDING_PAYMENT';

        } else if (data.paymentGateway === 'easypaisa') {
            // Mock Easypaisa deep link / URL
            paymentUrl = `https://easypaisa.com.pk/checkout?amount=${data.totalAmount}&store=Foodora`;
            data.paymentStatus = 'PENDING';
            data.status = 'PENDING_PAYMENT';

        } else if (data.paymentGateway === 'jazzcash') {
            // Mock JazzCash deep link / URL
            paymentUrl = `https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform?amount=${data.totalAmount}&store=Foodora`;
            data.paymentStatus = 'PENDING';
            data.status = 'PENDING_PAYMENT';

        } else if (data.paymentGateway === 'meezan') {
            paymentUrl = `/bank-transfer?bank=meezan&amount=${data.totalAmount}`;
            data.paymentStatus = 'PENDING';
            data.status = 'PENDING_PAYMENT';

        } else if (data.paymentGateway === 'ubl') {
            paymentUrl = `/bank-transfer?bank=ubl&amount=${data.totalAmount}`;
            data.paymentStatus = 'PENDING';
            data.status = 'PENDING_PAYMENT';

        } else {
            // COD
            data.paymentStatus = 'COD_PENDING';
            data.status = 'PLACED';
        }

        // 6. Geocode Delivery Address
        if (data.deliveryAddress && data.deliveryAddress.streetAddress) {
            const fullAddress = `${data.deliveryAddress.streetAddress}, ${data.deliveryAddress.city || 'Lahore'}`;
            const coords = await geocodeAddress(fullAddress);
            if (coords) {
                data.deliveryAddress.lat = coords.lat;
                data.deliveryAddress.lng = coords.lng;
            } else {
                // Fallback to a default location if geocoding fails (e.g., Lahore center)
                data.deliveryAddress.lat = 31.5204;
                data.deliveryAddress.lng = 74.3587;
            }
        }

        // 7. Initialize Status History
        data.statusHistory = [{ status: data.status, timestamp: new Date() }];

        const newOrder = await orderRepository.create(data);

        // Update Stripe Payment Intent metadata with the real MongoDB Order ID
        if (data.stripePaymentIntentId) {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            await stripe.paymentIntents.update(data.stripePaymentIntentId, {
                metadata: { orderId: newOrder._id.toString() }
            });
        }

        // Only increment order counts and notify restaurant if it's COD
        // Online payments will do this in the webhook upon success.
        if (data.paymentGateway === 'cod') {
            try {
                for (const cartItem of data.items) {
                    await MenuItem.findByIdAndUpdate(cartItem.menuItem, {
                        $inc: { orderCount: cartItem.quantity }
                    });
                }
            } catch (err) {
                console.error('[OrderService] Failed to increment order counts:', err.message);
            }

            try {
                const populatedRestaurant = await Restaurant.findById(data.restaurant).select('owner');
                if (populatedRestaurant?.owner) {
                    socketManager.emitToUser(
                        populatedRestaurant.owner.toString(),
                        'order:new',
                        { order: newOrder }
                    );
                }
            } catch (err) {
                console.error('[Socket.io] Failed to emit order:new:', err.message);
            }
        }

        // Return order with clientSecret or paymentUrl so frontend can proceed
        return {
            order: newOrder,
            clientSecret,
            paymentUrl
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
        const orderUserId = order.user?._id ? order.user._id.toString() : order.user?.toString();
        if (orderUserId !== userId.toString() && role !== 'admin' && role !== 'super_admin' && role !== 'restaurant_admin') {
            throw new ApiError(403, 'Not authorized to access this order');
        }

        return order;
    }

    async updateOrderStatus(orderId, newStatus, role = 'admin', additionalData = {}) {
        const Order = require('../models/order.model');
        const { enforceTransition } = require('../utils/orderStatusMachine');
        
        let order = await Order.findById(orderId);
        if (!order) throw new ApiError(404, 'Order not found');

        // Enforce state machine rules
        enforceTransition(order.status, newStatus, role);

        // Update fields
        order.status = newStatus;
        order.statusHistory.push({ status: newStatus, timestamp: new Date() });

        if (additionalData.estimatedDeliveryTime) order.estimatedDeliveryTime = additionalData.estimatedDeliveryTime;
        if (additionalData.rejectionReason) order.rejectionReason = additionalData.rejectionReason;
        if (additionalData.cancelledBy) order.cancelledBy = additionalData.cancelledBy;
        if (additionalData.rider) order.rider = additionalData.rider;

        await order.save();
        order = await orderRepository.findById(orderId); // get populated version

        // Socket notifications based on status
        try {
            socketManager.emitToOrderRoom(orderId, 'orderStatusUpdate', order);
            
            switch (newStatus) {
                case 'ACCEPTED':
                    socketManager.emitToOrderRoom(orderId, 'order:accepted', { orderId });
                    break;
                case 'REJECTED':
                    socketManager.emitToOrderRoom(orderId, 'order:rejected', { orderId, reason: additionalData.rejectionReason });
                    break;
                case 'PREPARING':
                    socketManager.emitToOrderRoom(orderId, 'order:preparing', { orderId });
                    break;
                case 'READY_FOR_PICKUP':
                    socketManager.emitToOrderRoom(orderId, 'order:ready', { orderId });
                    // In a real app, emit to nearby riders. For now, we rely on riders polling available deliveries.
                    break;
                case 'CANCELLED':
                    socketManager.emitToOrderRoom(orderId, 'order:cancelled', { orderId });
                    break;
            }
        } catch (err) {
            console.error('[Socket.io] Failed to emit order updates:', err.message);
        }

        return order;
    }

    async assignRider(orderId, riderId, role = 'admin') {
        const Rider = require('../models/rider.model');
        const rider = await Rider.findById(riderId);
        if (!rider) throw new ApiError(404, 'Rider not found');

        // Update order status to RIDER_ASSIGNED
        const order = await this.updateOrderStatus(orderId, 'RIDER_ASSIGNED', role, { rider: riderId });

        // Notify customer
        try {
            socketManager.emitToOrderRoom(orderId, 'order:rider_assigned', {
                orderId,
                riderName: rider.name,
                riderPhone: rider.phone,
                vehicleDetails: rider.vehicleDetails,
                status: 'RIDER_ASSIGNED'
            });

            // Notify the rider directly
            socketManager.emitToUser(rider.user.toString(), 'rider:new_delivery', { order });
        } catch (err) {
            console.error('[Socket.io] Failed to emit assignment:', err.message);
        }

        return { order, rider };
    }
}

module.exports = new OrderService();

