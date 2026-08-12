const http = require("http");

// Loaded first: it validates configuration and exits before anything else
// initialises against a half-configured environment.
const env = require("./config/env");
const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");
const socketManager = require("./socket");

const server = http.createServer(app);

socketManager.init(server);

const start = async () => {
    // Connect before listening so we never serve a request without a database.
    await connectDB();

    server.listen(env.PORT, () => {
        console.log(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
    });
};

/*
 * Graceful shutdown.
 *
 * The previous handler called `server.close()` without awaiting it and then went
 * straight to `process.exit(0)`, cutting off in-flight requests — including,
 * potentially, an order being written — mid-response. This drains connections
 * first and only forces an exit if draining stalls.
 */
let shuttingDown = false;

const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`${signal} received, shutting down...`);

    const forceExit = setTimeout(() => {
        console.error("Shutdown timed out after 10s, forcing exit");
        process.exit(1);
    }, 10_000);
    forceExit.unref();

    try {
        await socketManager.shutdown();
        await new Promise((resolve) => server.close(resolve));
        await disconnectDB();
        clearTimeout(forceExit);
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
};

["SIGINT", "SIGTERM"].forEach((signal) => process.on(signal, () => shutdown(signal)));

/*
 * A rejected promise nobody handled leaves the process in an unknown state.
 * Node's default is to print a warning and carry on, which means the server keeps
 * serving traffic from a state it cannot reason about; a controlled restart is
 * safer.
 */
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
    shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    shutdown("uncaughtException");
});

start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
