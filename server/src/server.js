require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const socketManager = require("./socket");

const PORT = process.env.PORT || 5000;

connectDB();

// Create HTTP server manually to attach socket.io
const server = http.createServer(app);

// Initialize Socket.io
socketManager.init(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
