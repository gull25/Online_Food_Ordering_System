const mongoose = require("mongoose");
const { MONGO_URI } = require("./env");

const connectDB = async () => {
    if (!MONGO_URI) {
        console.error("MONGO_URI is not set. Check your server/.env file.");
        process.exit(1);
    }

    // Buffered queries hide connection problems until the first request fails.
    mongoose.set("bufferCommands", false);

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
    });

    mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error.message);
    });

    try {
        const conn = await mongoose.connect(MONGO_URI, {
            // Fail fast instead of hanging when the container isn't up yet.
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        });

        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

        return conn.connection;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
};

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
