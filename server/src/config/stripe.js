const Stripe = require("stripe");
const ApiError = require("../utils/ApiError");

let client = null;

const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new ApiError(
            503,
            "Stripe is not configured. Set STRIPE_SECRET_KEY in server/.env to enable card payments.",
        );
    }

    if (!client) {
        client = Stripe(process.env.STRIPE_SECRET_KEY);
    }

    return client;
};

/*
 * Lazy proxy: callers keep using `stripe.accounts.create(...)` as before, but
 * the SDK is only built on first use. Constructing it at require-time made the
 * whole server refuse to boot when no key was set, taking down every unrelated
 * route with it. Missing config now surfaces as a 503 on payment routes only.
 */
module.exports = new Proxy(
    {},
    {
        get: (_target, prop) => {
            const stripe = getStripe();
            const value = stripe[prop];

            return typeof value === "function" ? value.bind(stripe) : value;
        },
    },
);
