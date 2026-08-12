const { Server } = require("socket.io");

const env = require("./config/env");
const { verifyToken } = require("./config/jwt");

/*
 * Realtime layer.
 *
 * The previous implementation had no authentication at all. Every handler took
 * the client's word for who it was, which meant an anonymous socket could:
 *
 *   - `register` as any user id and receive that user's private order
 *     notifications, including their delivery address;
 *   - `join:order_room` for any order id and watch a stranger's order progress
 *     and their courier's live GPS trail;
 *   - emit `rider:location_update` for any order, spoofing a courier's position
 *     on the customer's map and writing those coordinates to the database.
 *
 * Identity now comes from the same JWT the REST API uses, established once
 * during the handshake, and room membership is authorised against the database.
 */

let io;

/** userId -> Set<socketId>. A user with two tabs open has two sockets. */
const userSockets = new Map();

// Throttle state for GPS persistence and stale-signal detection, keyed by order.
const lastDbUpdate = new Map();
const lastLocationTime = new Map();
const staleTimers = new Map();

const STALE_THRESHOLD_MS = 30_000;
const DB_WRITE_INTERVAL_MS = 30_000;

const log = (...args) => {
    // Per-connection logging at info level is noise in production and, since it
    // included user ids, a slow leak of who is online into the log stream.
    if (!env.isProduction) console.log("[Socket.io]", ...args);
};

const trackSocket = (userId, socketId) => {
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socketId);
};

const untrackSocket = (userId, socketId) => {
    const sockets = userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(socketId);
    if (sockets.size === 0) userSockets.delete(userId);
};

const clearOrderTimers = (orderId) => {
    const timer = staleTimers.get(orderId);
    if (timer) clearTimeout(timer);
    staleTimers.delete(orderId);
    lastLocationTime.delete(orderId);
    lastDbUpdate.delete(orderId);
};

/**
 * May this socket watch this order?
 *
 * Required lazily: this module is loaded by services that the models also pull
 * in, and requiring at the top would close the cycle.
 */
const canAccessOrder = async (socket, orderId) => {
    const Order = require("./models/order.model");
    const Restaurant = require("./models/restaurant.model");
    const Rider = require("./models/rider.model");

    const order = await Order.findById(orderId).select("user restaurant rider").lean();
    if (!order) return false;

    const { userId, role } = socket.data;

    if (role === "admin" || role === "super_admin") return true;
    if (order.user?.toString() === userId) return true;

    if (role === "restaurant_admin") {
        const restaurant = await Restaurant.findOne({ owner: userId }).select("_id").lean();
        if (restaurant && order.restaurant?.toString() === restaurant._id.toString()) return true;
    }

    if (role === "rider") {
        const rider = await Rider.findOne({ user: userId }).select("_id").lean();
        // A rider can also watch an order that is still up for grabs, which is
        // what the "available deliveries" screen subscribes to.
        if (rider && (order.rider?.toString() === rider._id.toString() || !order.rider)) return true;
    }

    return false;
};

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: env.allowedOrigins,
                methods: ["GET", "POST"],
                credentials: true,
            },
            // Bounds a single frame; the default 1 MB is far more than any event
            // here sends and is a cheap memory-pressure lever for an attacker.
            maxHttpBufferSize: 100_000,
            pingTimeout: 30_000,
        });

        /*
         * Handshake authentication. Rejecting here means an unauthenticated
         * socket never reaches a single event handler, so no handler has to
         * re-check identity.
         */
        io.use((socket, next) => {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

            if (!token) return next(new Error("Authentication required"));

            try {
                const decoded = verifyToken(token);
                const userId = decoded.sub || decoded.id;
                if (!userId) return next(new Error("Invalid token"));

                socket.data.userId = String(userId);
                socket.data.role = decoded.role;
                next();
            } catch {
                next(new Error("Invalid or expired token"));
            }
        });

        io.on("connection", (socket) => {
            const { userId } = socket.data;

            // Identity comes from the verified token, so the old `register` event
            // — which took a user id from the client — is no longer needed. It is
            // still accepted as a no-op so older clients do not error.
            trackSocket(userId, socket.id);
            socket.join(`user_${userId}`);
            socket.on("register", () => {});

            log(`connected ${socket.id}`);

            // ── Rider's own room ─────────────────────────────────────────────
            socket.on("rider:join", async () => {
                if (socket.data.role !== "rider") return;

                const Rider = require("./models/rider.model");
                const rider = await Rider.findOne({ user: userId }).select("_id").lean();
                // Derived from the session, not from the client-supplied riderId
                // the old handler joined blindly.
                if (rider) socket.join(`rider_${rider._id}`);
            });

            // ── Order rooms ──────────────────────────────────────────────────
            socket.on("join:order_room", async (orderId, ack) => {
                if (!orderId || typeof orderId !== "string") return;

                try {
                    if (!(await canAccessOrder(socket, orderId))) {
                        if (typeof ack === "function") ack({ ok: false, error: "forbidden" });
                        return;
                    }

                    socket.join(`order_${orderId}`);
                    if (typeof ack === "function") ack({ ok: true });
                } catch (error) {
                    console.error("[Socket.io] join:order_room failed:", error.message);
                    if (typeof ack === "function") ack({ ok: false, error: "server_error" });
                }
            });

            socket.on("leave:order_room", (orderId) => {
                if (typeof orderId === "string") socket.leave(`order_${orderId}`);
            });

            // ── Courier GPS ──────────────────────────────────────────────────
            socket.on("rider:location_update", async ({ orderId, lat, lng } = {}) => {
                // Only a rider may report a position, and the coordinates have to
                // be real numbers in range — `lat == null` was the only check
                // before, so a string or an object went straight into the
                // database as a GeoJSON coordinate.
                if (socket.data.role !== "rider") return;
                if (typeof orderId !== "string") return;
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
                if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return;

                const Rider = require("./models/rider.model");
                const rider = await Rider.findOne({ user: userId }).select("_id").lean();
                if (!rider) return;

                const Order = require("./models/order.model");
                const order = await Order.findById(orderId).select("rider status").lean();
                // Only the assigned courier of a live delivery may move the pin.
                if (!order || order.rider?.toString() !== rider._id.toString()) return;

                io.to(`order_${orderId}`).emit("rider:location", { lat, lng, orderId });

                // ── Stale-signal detection ───────────────────────────────────
                lastLocationTime.set(orderId, Date.now());
                if (staleTimers.has(orderId)) clearTimeout(staleTimers.get(orderId));

                const timer = setTimeout(() => {
                    const last = lastLocationTime.get(orderId) ?? 0;
                    if (Date.now() - last >= STALE_THRESHOLD_MS) {
                        io.to(`order_${orderId}`).emit("rider:location_stale", { orderId });
                    }
                    staleTimers.delete(orderId);
                }, STALE_THRESHOLD_MS);

                // `unref` keeps a pending timer from holding the process open
                // during shutdown.
                timer.unref?.();
                staleTimers.set(orderId, timer);

                // ── Throttled persistence ────────────────────────────────────
                const now = Date.now();
                if (now - (lastDbUpdate.get(orderId) ?? 0) < DB_WRITE_INTERVAL_MS) return;
                lastDbUpdate.set(orderId, now);

                try {
                    await Promise.all([
                        Order.updateOne(
                            { _id: orderId },
                            {
                                // Capped so a long delivery cannot grow the order
                                // document without bound — `$push` alone had no
                                // ceiling, and a 16 MB document limit is reachable.
                                $push: {
                                    routeHistory: {
                                        $each: [{ lat, lng, timestamp: new Date() }],
                                        $slice: -500,
                                    },
                                },
                            },
                        ),
                        Rider.updateOne(
                            { _id: rider._id },
                            { currentLocation: { type: "Point", coordinates: [lng, lat] } },
                        ),
                    ]);
                } catch (error) {
                    console.error("[Socket.io] Failed to persist rider location:", error.message);
                }

                if (["DELIVERED", "CANCELLED", "REJECTED"].includes(order.status)) clearOrderTimers(orderId);
            });

            socket.on("disconnect", () => {
                untrackSocket(userId, socket.id);
                log(`disconnected ${socket.id}`);
            });
        });

        return io;
    },

    getIo: () => {
        if (!io) throw new Error("Socket.io is not initialised");
        return io;
    },

    /**
     * Emits to every socket a user has open.
     * The old map held one socket id per user, so a second tab silently replaced
     * the first and notifications stopped arriving in the original one.
     */
    emitToUser: (userId, event, data) => {
        if (!io || !userId) return;
        io.to(`user_${String(userId)}`).emit(event, data);
    },

    emitToOrderRoom: (orderId, event, data) => {
        if (!io || !orderId) return;
        io.to(`order_${String(orderId)}`).emit(event, data);
    },

    emitToRider: (riderId, event, data) => {
        if (!io || !riderId) return;
        io.to(`rider_${String(riderId)}`).emit(event, data);
    },

    /** Releases timers so the process can exit cleanly. */
    shutdown: async () => {
        for (const timer of staleTimers.values()) clearTimeout(timer);
        staleTimers.clear();
        lastLocationTime.clear();
        lastDbUpdate.clear();
        if (io) await io.close();
    },
};
