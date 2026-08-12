const { z } = require("zod");
const { objectId, email, phone, safeText, money, pagination } = require("./common.validation");

/*
 * Restaurant and menu writes previously forwarded `req.body` to
 * `findByIdAndUpdate`, so an owner could set `isFeatured: true`, `rating: 5`,
 * `numReviews: 9999`, `stripeOnboardingComplete: true` or even `owner:
 * <someone-else>` on their own restaurant. Those fields are all derived or
 * platform-controlled and are absent from these schemas, so they are stripped
 * before the controller runs.
 */

/*
 * Multipart bodies arrive as strings, so array/object fields have to be parsed
 * from JSON. The controllers used to do this inline with a swallowed try/catch,
 * meaning malformed JSON silently became the literal string and Mongoose threw
 * an opaque cast error later.
 */
const jsonish = (schema) =>
    z.preprocess((value) => {
        if (typeof value !== "string") return value;
        try {
            return JSON.parse(value);
        } catch {
            return z.NEVER;
        }
    }, schema);

/*
 * HTML forms submit every field they render, so an untouched optional input
 * arrives as `""` rather than being absent. Without this, the onboarding form —
 * which posts `email`, `phone` and `website` whether or not they were filled in —
 * would fail validation on a blank email and the owner could never create their
 * restaurant. An empty string is normalised to "not provided".
 */
const blankToUndefined = (schema) =>
    z.preprocess((value) => (typeof value === "string" && value.trim() === "" ? undefined : value), schema);

const CUISINES = z
    .array(safeText(40, "Cuisine").pipe(z.string().min(1)))
    .min(1, "Select at least one cuisine")
    .max(10);

const restaurantCore = {
    name: safeText(50, "Name").pipe(z.string().min(2, "Name is required")),
    description: safeText(500, "Description").pipe(z.string().min(10, "Please write a short description")),
    address: safeText(200, "Address").pipe(z.string().min(5, "Address is required")),
    city: safeText(80, "City").pipe(z.string().min(1, "City is required")),
    state: safeText(80, "State").pipe(z.string().min(1, "State is required")),
    zipCode: safeText(20, "Zip code").pipe(z.string().min(3, "Zip code is required")),
    cuisine: jsonish(CUISINES),
    phone: blankToUndefined(phone.optional()),
    email: blankToUndefined(email.optional()),
    website: blankToUndefined(z.string().trim().url("Please enter a valid URL").max(200).optional()),
    openingTime: blankToUndefined(safeText(20).optional()),
    closingTime: blankToUndefined(safeText(20).optional()),
    status: blankToUndefined(z.enum(["Open", "Closed"]).optional()),
    deliveryFee: blankToUndefined(money.optional()),
    minOrder: blankToUndefined(money.optional()),
    deliveryRadius: blankToUndefined(z.coerce.number().min(0.5).max(100).optional()),
    priceRange: blankToUndefined(z.enum(["$", "$$", "$$$", "$$$$"]).optional()),
    estimatedDeliveryTime: blankToUndefined(safeText(40).optional()),
    socialMedia: jsonish(
        z.object({
            facebook: z.string().trim().max(200).optional(),
            instagram: z.string().trim().max(200).optional(),
            tiktok: z.string().trim().max(200).optional(),
            whatsapp: z.string().trim().max(200).optional(),
        }),
    ).optional(),
    policies: jsonish(
        z.object({
            refund: safeText(2000).optional(),
            delivery: safeText(2000).optional(),
            privacy: safeText(2000).optional(),
        }),
    ).optional(),
};

const createRestaurantSchema = z.object(restaurantCore);

/*
 * Every field optional — but `.partial()` alone would also make an empty body
 * valid, silently succeeding with no change. The refinement forces at least one
 * field or an uploaded image.
 */
const updateRestaurantSchema = z.object(restaurantCore).partial();

const menuItemCore = {
    name: safeText(50, "Name").pipe(z.string().min(2, "Name is required")),
    description: safeText(500, "Description").pipe(z.string().min(5, "Description is required")),
    price: z.coerce.number().positive("Price must be greater than zero").max(100_000),
    discount: blankToUndefined(z.coerce.number().min(0).max(100).optional()),
    category: objectId,
    vegNonVeg: blankToUndefined(z.enum(["Veg", "Non-Veg", "N/A"]).optional()),
    // Checkbox inputs post "true"/"false"/"on"; `z.coerce.boolean()` treats any
    // non-empty string as true, so "false" would enable the item.
    isAvailable: z
        .preprocess((value) => {
            if (typeof value !== "string") return value;
            return value === "true" || value === "on" || value === "1";
        }, z.boolean())
        .optional(),
    ingredients: jsonish(z.array(safeText(60)).max(50)).optional(),
    sizes: jsonish(
        z
            .array(
                z.object({
                    name: safeText(60, "Size name").pipe(z.string().min(1)),
                    additionalPrice: z.coerce.number().min(0).max(100_000).default(0),
                }),
            )
            .max(20),
    ).optional(),
    addOns: jsonish(
        z
            .array(
                z.object({
                    name: safeText(60, "Add-on name").pipe(z.string().min(1)),
                    price: z.coerce.number().min(0).max(100_000).default(0),
                }),
            )
            .max(30),
    ).optional(),
};

const createMenuItemSchema = z.object(menuItemCore);
const updateMenuItemSchema = z.object(menuItemCore).partial();

const listRestaurantsSchema = pagination.extend({
    featured: z.enum(["true", "false"]).optional(),
    search: safeText(80).optional(),
    cuisine: safeText(40).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    sort: z.enum(["rating", "deliveryFee", "newest", "distance"]).default("rating"),
});

module.exports = {
    createRestaurantSchema,
    updateRestaurantSchema,
    createMenuItemSchema,
    updateMenuItemSchema,
    listRestaurantsSchema,
};
