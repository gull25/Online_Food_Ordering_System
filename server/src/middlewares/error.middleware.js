const multer = require("multer");
const { ZodError } = require("zod");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

/*
 * Central error translation.
 *
 * The previous handler passed `err.message` straight through with
 * `err.statusCode || 500`, which had three problems:
 *
 *   1. Anything unexpected (a Mongoose CastError, a driver failure, a TypeError)
 *      answered 500 with the raw internal message — leaking schema field names,
 *      file paths and driver internals to the client.
 *   2. It read `err.errors` for Zod, but Zod exposes `.issues`; `.errors` was
 *      removed in v4, so every validation failure threw a second TypeError
 *      *inside the error handler* and Express fell back to its HTML 500 page.
 *   3. Nothing was ever logged, so 500s were invisible in production.
 *
 * Each known error family is mapped to a deliberate status and a message that is
 * safe to show a user; everything else becomes a generic 500 and is logged in
 * full on the server.
 */

const normalize = (err) => {
    if (err instanceof ApiError) return err;

    // ── Request validation ───────────────────────────────────────────────────
    if (err instanceof ZodError) {
        const details = err.issues.map((issue) => ({
            field: issue.path.join(".") || "body",
            message: issue.message,
        }));
        const error = new ApiError(400, details[0]?.message || "Invalid request data");
        error.details = details;
        return error;
    }

    // ── Mongoose ─────────────────────────────────────────────────────────────
    if (err.name === "ValidationError" && err.errors) {
        const details = Object.values(err.errors).map((issue) => ({
            field: issue.path,
            message: issue.message,
        }));
        const error = new ApiError(400, details[0]?.message || "Validation failed");
        error.details = details;
        return error;
    }

    if (err.name === "CastError") {
        // `/api/orders/not-an-id` is a client mistake, not a server fault, and the
        // raw message names the internal collection and field.
        return new ApiError(400, `Invalid value for '${err.path}'`);
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
        return new ApiError(409, field ? `A record with this ${field} already exists` : "Duplicate record");
    }

    // ── Auth ─────────────────────────────────────────────────────────────────
    if (err.name === "TokenExpiredError") return new ApiError(401, "Session expired. Please log in again.");
    if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
        return new ApiError(401, "Invalid authentication token");
    }

    // ── Uploads ──────────────────────────────────────────────────────────────
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") return new ApiError(413, "Image is too large. Maximum size is 5 MB.");
        if (err.code === "LIMIT_UNEXPECTED_FILE") return new ApiError(400, `Unexpected file field '${err.field}'`);
        return new ApiError(400, "File upload failed");
    }

    // ── Payload parsing ──────────────────────────────────────────────────────
    if (err.type === "entity.too.large") return new ApiError(413, "Request body is too large");
    if (err.type === "entity.parse.failed") return new ApiError(400, "Malformed JSON in request body");

    // ── Anything else ────────────────────────────────────────────────────────
    const status = Number.isInteger(err.statusCode) ? err.statusCode : 500;
    if (status >= 500) return new ApiError(500, "Something went wrong on our end. Please try again.");

    return new ApiError(status, err.message || "Request failed");
};

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
const errorHandler = (err, req, res, next) => {
    const error = normalize(err);

    // Server-side faults always reach the logs with their original stack; client
    // faults are noise at anything above debug level.
    if (error.statusCode >= 500) {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err);
    } else if (!env.isProduction && !env.isTest) {
        console.warn(`[${req.method} ${req.originalUrl}] ${error.statusCode} ${error.message}`);
    }

    // Express 5 may have already begun streaming (e.g. the CSV report).
    if (res.headersSent) return next(err);

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(error.details ? { errors: error.details } : {}),
        ...(env.isProduction ? {} : { stack: err.stack }),
    });
};

module.exports = errorHandler;
