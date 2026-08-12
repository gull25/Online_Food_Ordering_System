const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const env = require("../config/env");

/*
 * Rate limiting.
 *
 * `express-rate-limit` was already a dependency but was never mounted, so
 * /api/auth/login accepted unlimited attempts — an offline-speed credential
 * stuffing target — and every other endpoint was equally free to hammer.
 *
 * Limits are disabled in the test environment so suites do not fail on the
 * 200th request, and are deliberately generous in development.
 */

const disabled = env.isTest;

const base = {
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skip: () => disabled,
    message: { success: false, message: "Too many requests. Please slow down and try again shortly." },
};

/** Broad ceiling for the whole API — catches scrapers and runaway clients. */
const apiLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: env.isProduction ? 300 : 2000,
});

/**
 * Credential endpoints. Keyed on IP *and* the submitted email so one attacker
 * cannot lock out a legitimate user by burning the shared-IP budget, and a
 * distributed attack still hits a per-account ceiling.
 */
const authLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: env.isProduction ? 10 : 100,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase() : "";
        /*
         * `ipKeyGenerator` collapses an IPv6 address to its /64 prefix. Keying on
         * the raw `req.ip` would let an IPv6 client walk through the addresses in
         * its own subnet — trillions of them — and never hit the limit.
         */
        return `${ipKeyGenerator(req.ip)}:${email}`;
    },
    message: {
        success: false,
        message: "Too many attempts. Please wait a few minutes before trying again.",
    },
});

/** Anything that sends mail or creates public records — spam control. */
const strictLimiter = rateLimit({
    ...base,
    windowMs: 60 * 60 * 1000,
    limit: env.isProduction ? 5 : 100,
    message: {
        success: false,
        message: "Too many requests for this action. Please try again later.",
    },
});

/** Order placement — bounded so a runaway client cannot flood the kitchen. */
const orderLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: env.isProduction ? 10 : 200,
    message: { success: false, message: "Too many orders placed. Please wait a moment." },
});

/** Image uploads are the most expensive request the API serves. */
const uploadLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: env.isProduction ? 20 : 200,
    message: { success: false, message: "Too many uploads. Please wait a moment." },
});

module.exports = { apiLimiter, authLimiter, strictLimiter, orderLimiter, uploadLimiter };
