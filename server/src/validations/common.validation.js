const { z } = require("zod");

/*
 * Shared primitives so every route validates identically.
 *
 * The `objectId` guard is what keeps NoSQL operator injection out of the query
 * builders. Mongoose casts whatever it is handed, so a field the code treats as
 * an id but which actually arrives as an object becomes a query operator —
 * `{ $ne: '' }` matches every document rather than none. Express 5's default
 * query parser cannot produce nested objects, and `express.urlencoded` is
 * configured with `extended: false` for the same reason, but JSON bodies can
 * carry any shape at all. Requiring a 24-hex string at the edge closes the whole
 * class regardless of how the value got in.
 */

const objectId = z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, "Must be a valid id");

const email = z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(254)
    .email("Please enter a valid email address");

/** E.164-ish: digits, spaces and the usual separators, 7-20 characters. */
const phone = z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^\+?\d[\d\s()-]{5,}$/, "Please enter a valid phone number");

const password = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[a-zA-Z]/, "Password must contain a letter")
    .regex(/\d/, "Password must contain a number");

/*
 * Control characters serve no purpose in user-supplied content and are the
 * vehicle for log-injection and terminal-escape tricks, so they are stripped
 * rather than rejected. Built from a string so the source file itself stays
 * free of literal control bytes.
 */
const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

/** Free text that ends up rendered in a browser or an email. */
const safeText = (max, label = "This field") =>
    z
        .string()
        .trim()
        .max(max, `${label} must be at most ${max} characters`)
        .transform((value) => value.replace(CONTROL_CHARS, ""));

const money = z.coerce.number().finite().nonnegative().max(1_000_000);

/** Cursor-free pagination, applied to every list endpoint. */
const pagination = z.object({
    page: z.coerce.number().int().min(1).default(1),
    // A hard ceiling stops `?limit=1000000` from turning a list endpoint into a
    // full-collection dump.
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParam = z.object({ id: objectId });

module.exports = { objectId, email, phone, password, safeText, money, pagination, idParam };
