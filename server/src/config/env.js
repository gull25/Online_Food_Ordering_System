const path = require("path");
const { z } = require("zod");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

/*
 * Configuration is validated once, at boot.
 *
 * Previously each module read `process.env` directly and supplied its own
 * fallback — most damagingly `process.env.JWT_SECRET || 'secretkey123'` in three
 * places. A deployment that forgot to set JWT_SECRET therefore started happily
 * and signed every session with a constant that is published in this repository,
 * meaning anyone could mint a token for any user id. Failing to start is the
 * only safe response to a missing signing key, so there are no secret defaults
 * here and the process exits with a readable report instead.
 */

const bool = (defaultValue) =>
    z
        .string()
        .optional()
        .transform((value) => (value === undefined ? defaultValue : value === "true" || value === "1"));

const csv = z
    .string()
    .optional()
    .transform((value) =>
        (value ?? "")
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean),
    );

const schema = z
    .object({
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        PORT: z.coerce.number().int().positive().default(5000),

        MONGO_URI: z.string().min(1, "MONGO_URI is required"),

        // 32 chars is the practical floor for an HS256 secret; shorter keys are
        // brute-forceable offline once a single token leaks.
        JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
        JWT_EXPIRE: z.string().default("7d"),

        CLIENT_URL: z.string().url().default("http://localhost:5173"),
        // Extra browser origins allowed through CORS (comma separated).
        CORS_ORIGINS: csv,

        LOG_LEVEL: z.enum(["silent", "dev", "combined"]).default("dev"),
        TRUST_PROXY: bool(false),

        CLOUDINARY_CLOUD_NAME: z.string().optional(),
        CLOUDINARY_API_KEY: z.string().optional(),
        CLOUDINARY_API_SECRET: z.string().optional(),

        STRIPE_SECRET_KEY: z.string().optional(),
        STRIPE_WEBHOOK_SECRET: z.string().optional(),

        SMTP_HOST: z.string().optional(),
        SMTP_PORT: z.coerce.number().int().positive().default(587),
        SMTP_EMAIL: z.string().optional(),
        SMTP_PASSWORD: z.string().optional(),
        FROM_NAME: z.string().default("Foodora"),
        FROM_EMAIL: z.string().default("noreply@foodora.com"),

        GEOCODER_USER_AGENT: z.string().default("Foodora/1.0 (support@foodora.example)"),
    })
    .superRefine((value, ctx) => {
        if (value.NODE_ENV !== "production") return;

        // These are optional in development (the app degrades gracefully) but a
        // production deployment silently missing them is a misconfiguration.
        if (value.STRIPE_SECRET_KEY && !value.STRIPE_WEBHOOK_SECRET) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["STRIPE_WEBHOOK_SECRET"],
                message: "STRIPE_WEBHOOK_SECRET is required when Stripe is enabled in production",
            });
        }
    });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    const details = parsed.error.issues
        .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("\n");

    console.error(`\nInvalid server configuration:\n${details}\n\nCheck server/.env against server/.env.example.\n`);
    process.exit(1);
}

const env = Object.freeze({
    ...parsed.data,
    isProduction: parsed.data.NODE_ENV === "production",
    isTest: parsed.data.NODE_ENV === "test",
    /** Every origin the browser may call the API from. */
    allowedOrigins: Array.from(new Set([parsed.data.CLIENT_URL, ...parsed.data.CORS_ORIGINS])),
    stripeEnabled: Boolean(parsed.data.STRIPE_SECRET_KEY),
    cloudinaryEnabled: Boolean(parsed.data.CLOUDINARY_API_KEY && parsed.data.CLOUDINARY_API_SECRET),
    emailEnabled: Boolean(parsed.data.SMTP_HOST && parsed.data.SMTP_EMAIL && parsed.data.SMTP_PASSWORD),
});

module.exports = env;
