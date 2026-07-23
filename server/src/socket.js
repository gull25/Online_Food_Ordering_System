const { Server } = require("socket.io");

let io;

// Map to keep track of userId -> socketId
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

            // When frontend connects, they should emit a 'register' event with their userId
            socket.on("register", (userId) => {
                userSocketMap.set(userId, socket.id);
                console.log(`[Socket.io] Registered User ${userId} with socket ${socket.id}`);
            });

            socket.on("disconnect", () => {
                console.log(`[Socket.io] Client disconnected: ${socket.id}`);
                // Remove from map on disconnect
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
        if (!io) {
            throw new Error("Socket.io is not initialized!");
        }
        return io;
    },

    getSocketIdByUserId: (userId) => {
        return userSocketMap.get(userId.toString());
    }
};
