require("dotenv").config();

const http = require("http");
const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");
const socketManager = require("./socket");

const PORT = process.env.PORT || 5000;

// Create HTTP server manually to attach socket.io
const server = http.createServer(app);

// Initialize Socket.io
socketManager.init(server);

const start = async () => {
    // Connect before listening so we never serve requests without a database.
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down...`);

    server.close();

    await disconnectDB();

    process.exit(0);
};

["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => shutdown(signal));
});

start();
