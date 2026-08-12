const mongoose = require("mongoose");
const env = require("./env");

/*
 * Auto-index is disabled in production. Mongoose otherwise issues a
 * `createIndex` for every schema index on every boot; on a large collection that
 * is a blocking build during startup, and it silently masks the fact that
 * indexes should be a deliberate migration step.
 */
mongoose.set("autoIndex", !env.isProduction);

// Unknown fields in a query filter throw instead of being silently ignored,
// which turns a typo like `{ resturant: id }` into an error rather than a query
// that quietly matches every document.
mongoose.set("strictQuery", true);

// Buffered commands hide connection problems until the first request times out.
mongoose.set("bufferCommands", false);

const connectDB = async () => {
    mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
    mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));
    mongoose.connection.on("error", (error) => console.error("MongoDB error:", error.message));

    try {
        const conn = await mongoose.connect(env.MONGO_URI, {
            // Fail fast rather than hanging when the database is not up yet.
            serverSelectionTimeoutMS: 10_000,
            socketTimeoutMS: 45_000,
            maxPoolSize: 20,
            minPoolSize: 2,
            // Reads may be served by a secondary when one exists; harmless on a
            // standalone deployment.
            retryWrites: true,
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

module.exports = { connectDB, disconnectDB };
