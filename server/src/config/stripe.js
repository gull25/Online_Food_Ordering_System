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
