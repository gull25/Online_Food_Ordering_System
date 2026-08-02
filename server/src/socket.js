const { Server } = require("socket.io");

let io;

// Map to keep track of userId -> socketId (for direct user targeting)
const userSocketMap = new Map();

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true,
            },
        });

        io.on("connection", (socket) => {
            console.log(`[Socket.io] Client connected: ${socket.id}`);

            // ── Register user ID ───────────────────────────────────────────────
            // Frontend emits this right after connecting so the server can
            // map userId -> socketId for direct targeting.
            socket.on("register", (userId) => {
                if (!userId) return;
                userSocketMap.set(userId.toString(), socket.id);
                console.log(`[Socket.io] Registered User ${userId} -> socket ${socket.id}`);
            });

            // ── Join rider room ────────────────────────────────────────────────
            socket.on("rider:join", (riderId) => {
                if (!riderId) return;
                const room = `rider_${riderId}`;
                socket.join(room);
                console.log(`[Socket.io] Socket ${socket.id} joined rider room ${room}`);
            });

            // ── Join an order room ─────────────────────────────────────────────
            // Both the customer and the restaurant admin join the same room so
            // any order event is broadcast to all relevant parties at once.
            // Room name: "order_<orderId>"
            socket.on("join:order_room", (orderId) => {
                if (!orderId) return;
                const room = `order_${orderId}`;
                socket.join(room);
                console.log(`[Socket.io] Socket ${socket.id} joined room ${room}`);
            });

            // ── Leave an order room ────────────────────────────────────────────
            socket.on("leave:order_room", (orderId) => {
                if (!orderId) return;
                const room = `order_${orderId}`;
                socket.leave(room);
                console.log(`[Socket.io] Socket ${socket.id} left room ${room}`);
            });

            // ── Rider: live GPS location update ────────────────────────────────
            // Rider app/simulator emits this every few seconds.
            // Payload: { orderId: string, lat: number, lng: number, riderId: string }
            socket.on("rider:location_update", async ({ orderId, lat, lng, riderId }) => {
                if (!orderId || lat == null || lng == null) return;

                // Broadcast real-time location to everyone in the order room
                io.to(`order_${orderId}`).emit("rider:location", { lat, lng, orderId });

                // Persist latest location to MongoDB (best-effort, non-blocking)
                if (orderId) {
                    try {
                        const Order = require("./models/Order");
                        await Order.findByIdAndUpdate(orderId, {
                            $push: { routeHistory: { lat, lng, timestamp: new Date() } }
                        });
                    } catch (err) {
                        console.error("[Socket.io] Failed to update order routeHistory in DB:", err.message);
                    }
                }

                if (riderId) {
                    try {
                        const Rider = require("./models/Rider");
                        await Rider.findByIdAndUpdate(riderId, {
                            currentLocation: {
                                type: "Point",
                                coordinates: [lng, lat],
                            },
                        });
                    } catch (err) {
                        console.error("[Socket.io] Failed to update rider location in DB:", err.message);
                    }
                }
            });

            // ── Disconnect ─────────────────────────────────────────────────────
            socket.on("disconnect", () => {
                console.log(`[Socket.io] Client disconnected: ${socket.id}`);
                for (let [userId, socketId] of userSocketMap.entries()) {
                    if (socketId === socket.id) {
                        userSocketMap.delete(userId);
                        console.log(`[Socket.io] Unregistered User ${userId}`);
                        break;
                    }
                }
            });
        });

        return io;
    },

    getIo: () => {
        if (!io) throw new Error("Socket.io is not initialized!");
        return io;
    },

    // Emit to a specific user by their MongoDB user ID
    emitToUser: (userId, event, data) => {
        if (!io) return;
        const socketId = userSocketMap.get(userId.toString());
        if (socketId) {
            io.to(socketId).emit(event, data);
        }
    },

    // Emit to everyone in an order room (customer + restaurant admin)
    emitToOrderRoom: (orderId, event, data) => {
        if (!io) return;
        io.to(`order_${orderId}`).emit(event, data);
    },

    // Emit to a specific rider room
    emitToRider: (riderId, event, data) => {
        if (!io) return;
        io.to(`rider_${riderId}`).emit(event, data);
    },

    getSocketIdByUserId: (userId) => {
        return userSocketMap.get(userId.toString());
    },
};
