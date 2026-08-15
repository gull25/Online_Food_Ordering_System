const orderRepository = require("../repositories/order.repository");
const Order = require("../models/order.model");
const MenuItem = require("../models/menuItem.model");
const Offer = require("../models/offer.model");
const Restaurant = require("../models/restaurant.model");
const Rider = require("../models/rider.model");
const ApiError = require("../utils/ApiError");
const { geocodeAddress } = require("../utils/geocoder");
const { enforceTransition } = require("../utils/orderStatusMachine");
const pricing = require("../utils/pricing");
const socketManager = require("../socket");

/** Fallback map centre when geocoding is unavailable. */
const DEFAULT_COORDS = { lat: 31.5204, lng: 74.3587 };

class OrderService {
    /**
     * Prices an order from the database and creates it.
     *
     * `data` has already been through `createOrderSchema`, so it contains only
     * the customer's genuine choices — no prices, totals, status or rider. Every
     * monetary figure below is derived here; nothing about money is trusted from
     * the request.
     */
    async createOrder(userId, data) {
        const restaurant = await Restaurant.findById(data.restaurant)
            .select("_id name owner deliveryFee minOrder status stripeAccountId stripeOnboardingComplete")
            .lean();

        if (!restaurant) throw new ApiError(404, "Restaurant not found");
        if (restaurant.status !== "Open") {
            throw new ApiError(409, `${restaurant.name} is not accepting orders right now`);
        }

        const { items, subtotal } = await this.#priceItems(data.items, restaurant._id);

        const discountPercent = await this.#resolveDiscount(data.promoCode, restaurant._id);
        const totals = pricing.calculateTotals({
            subtotal,
            discountPercent,
            deliveryFee: restaurant.deliveryFee || 0,
        });

        if (restaurant.minOrder && totals.subtotal < restaurant.minOrder) {
            throw new ApiError(
                400,
                `Minimum order for ${restaurant.name} is ${restaurant.minOrder.toFixed(2)}`,
            );
        }

        const deliveryAddress = { ...data.deliveryAddress, ...(await this.#resolveCoords(data.deliveryAddress)) };

        // `cash` and `cod` are the same choice spelled two ways (see the note in
        // order.validation.js); both normalise to the `cod` gateway.
        const gateway = data.paymentMethod === "cash" ? "cod" : data.paymentMethod;
        const isCod = gateway === "cod";

        const order = await this.#persist({
            user: userId,
            restaurant: restaurant._id,
            items,
            deliveryAddress,
            promoCode: data.promoCode,
            paymentMethod: data.paymentMethod,
            paymentGateway: gateway,
            idempotencyKey: data.idempotencyKey,
            ...totals,
            riderEarning: pricing.riderEarning(totals.totalAmount),
            status: isCod ? "PLACED" : "PENDING_PAYMENT",
            paymentStatus: isCod ? "COD_PENDING" : "PENDING",
        });

        const payment = await this.#preparePayment({ order, restaurant, gateway, totals });

        if (isCod) {
            await this.recordOrderPlaced(order);
        }

        return { order, ...payment };
    }

    /**
     * Re-prices the cart against the database.
     */
    async #priceItems(cartItems, restaurantId) {
        const uniqueIds = [...new Set(cartItems.map((item) => item.menuItem))];

        const menuItems = await MenuItem.find({ _id: { $in: uniqueIds } })
            .select("_id name price sizes addOns restaurant isAvailable")
            .lean();

        const byId = new Map(menuItems.map((item) => [item._id.toString(), item]));

        const missing = uniqueIds.filter((id) => !byId.has(id));
        if (missing.length > 0) {
            throw new ApiError(400, "Some items in your cart are no longer available");
        }

        for (const item of menuItems) {
            // Cross-restaurant carts would otherwise bill one restaurant for
            // another's food.
            if (item.restaurant.toString() !== restaurantId.toString()) {
                throw new ApiError(400, "You can only order from one restaurant at a time");
            }
            if (item.isAvailable === false) {
                throw new ApiError(409, `${item.name} is currently unavailable`);
            }
        }

        let subtotal = 0;

        const items = cartItems.map((cartItem) => {
            const dbItem = byId.get(cartItem.menuItem);
            let unitPrice = dbItem.price;

            let selectedSize;
            if (cartItem.selectedSize?.name) {
                const size = dbItem.sizes?.find((option) => option.name === cartItem.selectedSize.name);
                if (!size) {
                    throw new ApiError(400, `"${cartItem.selectedSize.name}" is not an option for ${dbItem.name}`);
                }
                unitPrice += size.additionalPrice;
                selectedSize = { name: size.name, additionalPrice: size.additionalPrice };
            }

            const selectedAddOns = (cartItem.selectedAddOns ?? []).map((requested) => {
                const addOn = dbItem.addOns?.find((option) => option.name === requested.name);
                if (!addOn) {
                    throw new ApiError(400, `"${requested.name}" is not an add-on for ${dbItem.name}`);
                }
                unitPrice += addOn.price;
                return { name: addOn.name, price: addOn.price };
            });

            subtotal += unitPrice * cartItem.quantity;

            return {
                menuItem: dbItem._id,
                name: dbItem.name,
                quantity: cartItem.quantity,
                price: pricing.round(unitPrice),
                ...(selectedSize ? { selectedSize } : {}),
                selectedAddOns,
            };
        });

        return { items, subtotal: pricing.round(subtotal) };
    }

    /**
     * Looks up a promo code.
     */
    async #resolveDiscount(promoCode, restaurantId) {
        if (!promoCode) return 0;

        const offer = await Offer.findOne({
            code: promoCode,
            isActive: true,
            validUntil: { $gte: new Date() },
            restaurantId,
        })
            .select("discountPercentage")
            .lean();

        if (!offer) throw new ApiError(400, "That promo code is invalid, expired, or not valid here");

        return offer.discountPercentage;
    }

    async #resolveCoords(address) {
        if (!address?.streetAddress) return DEFAULT_COORDS;

        const coords = await geocodeAddress(`${address.streetAddress}, ${address.city}`);
        return coords ?? DEFAULT_COORDS;
    }

    /**
     * Writes the order, relying on the unique index for idempotency.
     */
    async #persist(payload) {
        try {
            return await orderRepository.create(payload);
        } catch (error) {
            if (error.code === 11000 && payload.idempotencyKey) {
                const existing = await Order.findOne({ idempotencyKey: payload.idempotencyKey });
                if (existing) return existing;
            }
            throw error;
        }
    }

    async #preparePayment({ order, restaurant, gateway, totals }) {
        if (gateway === "cod") return { clientSecret: null, paymentUrl: null };

        if (gateway === "stripe") {
            const stripe = require("../config/stripe");
            const amountInCents = Math.round(totals.totalAmount * 100);

            const payload = {
                amount: amountInCents,
                currency: "usd",
                automatic_payment_methods: { enabled: true },
                metadata: { orderId: order._id.toString() },
            };

            if (restaurant.stripeAccountId && restaurant.stripeOnboardingComplete) {
                const platformFee = pricing.platformFee(totals);
                payload.application_fee_amount = Math.min(Math.round(platformFee * 100), amountInCents);
                payload.transfer_data = { destination: restaurant.stripeAccountId };
            }

            const intent = await stripe.paymentIntents.create(payload);

            order.stripePaymentIntentId = intent.id;
            await order.save();

            return { clientSecret: intent.client_secret, paymentUrl: null };
        }
        const amount = totals.totalAmount;
        const urls = {

            meezan: `/bank-transfer?bank=meezan&amount=${amount}`,
            ubl: `/bank-transfer?bank=ubl&amount=${amount}`,
        };

        return { clientSecret: null, paymentUrl: urls[gateway] ?? null };
    }

    /**
     * Side effects that happen once an order actually enters the kitchen —
     * shared by the COD path and the payment-confirmation path so the two can
     * never drift.
     */
    async recordOrderPlaced(order) {
        try {
            await MenuItem.bulkWrite(
                order.items.map((item) => ({
                    updateOne: {
                        filter: { _id: item.menuItem },
                        update: { $inc: { orderCount: item.quantity } },
                    },
                })),
                { ordered: false },
            );
        } catch (error) {
            console.error("[OrderService] Failed to increment order counts:", error.message);
        }

        try {
            const restaurant = await Restaurant.findById(order.restaurant).select("owner").lean();
            if (restaurant?.owner) {
                socketManager.emitToUser(restaurant.owner.toString(), "order:new", { order });
            }
        } catch (error) {
            console.error("[OrderService] Failed to emit order:new:", error.message);
        }
    }

    async getMyOrders(userId, { page, limit }) {
        return orderRepository.findByUser(userId, { page, limit });
    }

    /**
     * Fetches one order, enforcing that the caller is a party to it.
     */
    async getOrderById(orderId, user) {
        const order = await orderRepository.findById(orderId);
        if (!order) throw new ApiError(404, "Order not found");

        if (!this.#canView(order, user)) {
            throw new ApiError(404, "Order not found");
        }

        return order;
    }

    #canView(order, user) {
        if (user.role === "admin" || user.role === "super_admin") return true;

        const orderUserId = (order.user?._id ?? order.user)?.toString();
        if (orderUserId === user.id) return true;

        if (user.role === "restaurant_admin" && user.restaurantId) {
            const restaurantId = (order.restaurant?._id ?? order.restaurant)?.toString();
            if (restaurantId === user.restaurantId) return true;
        }

        if (user.role === "rider" && user.riderId) {
            const riderId = (order.rider?._id ?? order.rider)?.toString();
            if (riderId === user.riderId) return true;
        }

        return false;
    }

    /**
     * Advances an order's status.
    
     */
    async updateOrderStatus(orderId, newStatus, user, extra = {}) {
        // Raw document, not lean: it is mutated and saved below.
        const order = await orderRepository.findRawById(orderId);
        if (!order) throw new ApiError(404, "Order not found");

        this.#assertCanTransition(order, user);
        enforceTransition(order.status, newStatus, user.role);

        order.status = newStatus;
        order.statusHistory.push({ status: newStatus, timestamp: new Date() });

        if (newStatus === "REJECTED" && extra.rejectionReason) {
            order.rejectionReason = extra.rejectionReason;
        }

        if (newStatus === "CANCELLED") {
            // Derived from who is calling, not from a client-supplied field.
            order.cancelledBy = user.role === "customer" ? "customer" : "restaurant";
        }

        if (extra.rider) order.rider = extra.rider;

        await order.save();

        const populated = await orderRepository.findById(orderId);
        this.#broadcastStatus(orderId, newStatus, populated, extra);

        return populated;
    }

    #assertCanTransition(order, user) {
        if (user.role === "admin" || user.role === "super_admin") return;

        if (user.role === "customer") {
            if (order.user.toString() !== user.id) throw new ApiError(404, "Order not found");
            return;
        }

        if (user.role === "restaurant_admin") {
            if (!user.restaurantId || order.restaurant.toString() !== user.restaurantId) {
                throw new ApiError(404, "Order not found");
            }
            return;
        }

        if (user.role === "rider") {
            if (!user.riderId || order.rider?.toString() !== user.riderId) {
                throw new ApiError(403, "You are not assigned to this delivery");
            }
            return;
        }

        throw new ApiError(403, "You do not have permission to update this order");
    }

    #broadcastStatus(orderId, newStatus, order, extra) {
        try {
            socketManager.emitToOrderRoom(orderId, "orderStatusUpdate", order);

            const events = {
                ACCEPTED: "order:accepted",
                REJECTED: "order:rejected",
                PREPARING: "order:preparing",
                READY_FOR_PICKUP: "order:ready",
                CANCELLED: "order:cancelled",
            };

            const event = events[newStatus];
            if (event) {
                socketManager.emitToOrderRoom(orderId, event, {
                    orderId,
                    ...(newStatus === "REJECTED" ? { reason: extra.rejectionReason } : {}),
                });
            }
        } catch (error) {
            console.error("[OrderService] Failed to emit order updates:", error.message);
        }
    }

    /** Assigns a courier. Only the owning restaurant (or an admin) may do this. */
    async assignRider(orderId, riderId, user) {
        const rider = await Rider.findById(riderId).select("_id user name phone vehicleDetails status").lean();
        if (!rider) throw new ApiError(404, "Rider not found");

        const order = await this.updateOrderStatus(orderId, "RIDER_ASSIGNED", user, { rider: riderId });

        try {
            socketManager.emitToOrderRoom(orderId, "order:rider_assigned", {
                orderId,
                riderName: rider.name,
                riderPhone: rider.phone,
                vehicleDetails: rider.vehicleDetails,
                status: "RIDER_ASSIGNED",
            });
            socketManager.emitToUser(rider.user.toString(), "rider:new_delivery", { order });
        } catch (error) {
            console.error("[OrderService] Failed to emit rider assignment:", error.message);
        }

        return { order, rider };
    }
}

module.exports = new OrderService();
