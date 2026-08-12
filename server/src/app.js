const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const env = require("./config/env");
const ApiError = require("./utils/ApiError");
const errorHandler = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rateLimit.middleware");

const app = express();

/*
 * Behind a load balancer or reverse proxy, `req.ip` is the proxy's address
 * unless Express is told to read X-Forwarded-For. Rate limiting keyed on the
 * wrong address either buckets every user together or is trivially bypassed, so
 * this is opt-in via TRUST_PROXY rather than always-on (trusting the header when
 * there is no proxy in front lets a client spoof its own IP).
 */
if (env.TRUST_PROXY) app.set("trust proxy", 1);

app.disable("x-powered-by");

// ── Security headers ─────────────────────────────────────────────────────────
// The API serves JSON, not HTML, so a restrictive CSP costs nothing here. COEP
// is left off because it breaks Stripe's hosted assets when the same origin is
// used to serve the built client.
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": ["'none'"],
                "frame-ancestors": ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        referrerPolicy: { policy: "no-referrer" },
    }),
);

// ── CORS ─────────────────────────────────────────────────────────────────────
/*
 * `origin: true` reflects whichever origin asked, which combined with
 * `credentials: true` means any website could call this API with the visitor's
 * session attached. That was the previous non-production behaviour. An explicit
 * allowlist applies in every environment; localhost variants are added in
 * development so the Vite dev server still works on either host spelling.
 */
const allowedOrigins = new Set(env.allowedOrigins);
if (!env.isProduction) {
    ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173"].forEach((origin) =>
        allowedOrigins.add(origin),
    );
}

app.use(
    cors({
        origin(origin, callback) {
            // Same-origin requests and non-browser clients (curl, health checks,
            // server-to-server webhooks) send no Origin header at all.
            if (!origin || allowedOrigins.has(origin)) return callback(null, true);
            return callback(new ApiError(403, "Origin not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        maxAge: 86400,
    }),
);

// ── Observability ────────────────────────────────────────────────────────────
if (env.LOG_LEVEL !== "silent") {
    app.use(
        morgan(env.isProduction ? "combined" : "dev", {
            skip: (req) => req.path === "/api/health",
        }),
    );
}

app.use(compression());
app.use(cookieParser());

// ── Body parsing ─────────────────────────────────────────────────────────────
/*
 * Stripe signs the exact bytes it sent, so the webhook must see the raw body and
 * has to be mounted before the JSON parser. Everything else is capped at 1 MB —
 * unbounded JSON bodies are a trivial memory-exhaustion vector, and no endpoint
 * here legitimately posts more (file uploads go through multer, which has its
 * own limit).
 */
app.use("/api/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
/*
 * `extended: false` uses the querystring parser rather than qs, so a form body
 * of `restaurantId[$ne]=x` arrives as the literal key `restaurantId[$ne]`
 * instead of a nested `{ $ne: 'x' }` object that Mongoose would treat as a query
 * operator. Nothing in this API posts nested form data — file uploads go through
 * multer and everything else is JSON — so the flexibility bought nothing and
 * only widened the input surface.
 */
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// ── Health ───────────────────────────────────────────────────────────────────
/*
 * The old /api/status hardcoded `db: "connected"`, so an orchestrator polling it
 * would keep routing traffic to an instance whose database had gone away. This
 * reports the real connection state and answers 503 when it is not usable.
 */
const healthPayload = () => {
    const dbReady = mongoose.connection.readyState === 1;
    return {
        status: dbReady ? "ok" : "degraded",
        db: ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] ?? "unknown",
        uptime: Math.round(process.uptime()),
        environment: env.NODE_ENV,
    };
};

app.get(["/api/health", "/api/status"], (req, res) => {
    const payload = healthPayload();
    res.status(payload.status === "ok" ? 200 : 503).json(payload);
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", apiLimiter, require("./routes/index.routes"));

// Unknown routes must produce the same JSON error shape as everything else;
// Express's default HTML 404 page breaks clients that always parse JSON.
app.use((req, res, next) => {
    next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorHandler);

module.exports = app;
