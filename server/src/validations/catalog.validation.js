const { z } = require("zod");
const { objectId, email, safeText, pagination } = require("./common.validation");

/*
 * Categories, offers, reviews, subscribers and profile updates.
 *
 * `restaurantId` is absent from the category and offer schemas on purpose: the
 * controllers derive it from the authenticated owner, and accepting it from the
 * body would let one restaurant attach categories and promo codes to another's
 * menu.
 */

// ── Categories ───────────────────────────────────────────────────────────────
const createCategorySchema = z.object({
    name: safeText(50, "Name").pipe(z.string().min(1, "Category name is required")),
    description: safeText(500, "Description").optional(),
    order: z.coerce.number().int().min(0).max(9999).optional(),
    isActive: z.coerce.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

// ── Offers ───────────────────────────────────────────────────────────────────
const offerCore = {
    type: z.enum(["BOGO", "PERCENTAGE", "FLAT", "EXCLUSIVE"]).optional(),
    title: safeText(120, "Title").pipe(z.string().min(2, "Title is required")),
    description: safeText(500, "Description").optional(),
    discountPercentage: z.coerce.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%"),
    // Alphanumeric only. The old flow interpolated this straight into
    // `new RegExp(...)`, so a code of `(a+)+$` was a ReDoS payload and `.*` matched
    // every offer in the collection.
    code: z
        .string()
        .trim()
        .toUpperCase()
        .min(3, "Promo code must be at least 3 characters")
        .max(24, "Promo code is too long")
        .regex(/^[A-Z0-9_-]+$/, "Promo codes may only contain letters, numbers, hyphens and underscores")
        .optional(),
    validUntil: z.coerce
        .date()
        .refine((date) => date.getTime() > Date.now(), "Expiry date must be in the future"),
    isActive: z.coerce.boolean().optional(),
};

const createOfferSchema = z.object(offerCore);
const updateOfferSchema = z.object(offerCore).partial();

const promoCodeParam = z.object({
    code: z
        .string()
        .trim()
        .toUpperCase()
        .min(1)
        .max(24)
        .regex(/^[A-Z0-9_-]+$/, "Invalid promo code"),
});

const promoCodeQuery = z.object({
    // The client sends the literal string "undefined" when no restaurant is in
    // context; treat that as absent rather than as an id.
    restaurantId: z
        .string()
        .trim()
        .optional()
        .transform((value) => (!value || value === "undefined" || value === "null" ? undefined : value))
        .pipe(objectId.optional()),
});

// ── Reviews ──────────────────────────────────────────────────────────────────
const reviewCore = {
    orderId: objectId,
    rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: safeText(500, "Comment").optional(),
};

/*
 * `restaurantId` is intentionally not accepted. Both handlers used to require
 * the client to send it and then check it matched the order — a check that
 * exists only because the value was taken from the client in the first place.
 * Reading it off the order removes both the round trip and the failure mode.
 */
const createReviewSchema = z.object(reviewCore);
const createItemReviewSchema = z.object({ ...reviewCore, menuItemId: objectId });

// ── Subscribers ──────────────────────────────────────────────────────────────
const subscribeSchema = z.object({
    email,
    restaurantId: objectId.optional(),
});

// ── User profile ─────────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
    name: safeText(80, "Name").pipe(z.string().min(2, "Name must be at least 2 characters")).optional(),
    phone: z
        .string()
        .trim()
        .max(20)
        .regex(/^\+?\d[\d\s()-]{5,}$/, "Please enter a valid phone number")
        .optional()
        .or(z.literal("")),
});

const listReviewsSchema = pagination;

module.exports = {
    createCategorySchema,
    updateCategorySchema,
    createOfferSchema,
    updateOfferSchema,
    promoCodeParam,
    promoCodeQuery,
    createReviewSchema,
    createItemReviewSchema,
    subscribeSchema,
    updateProfileSchema,
    listReviewsSchema,
};
