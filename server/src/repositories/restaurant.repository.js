const Restaurant = require("../models/restaurant.model");

/*
 * List fields are projected explicitly. The listing endpoint returned whole
 * documents — policies, social links, the Stripe account id and the owner's
 * user id — to every anonymous visitor browsing the home page.
 */
const LIST_FIELDS =
    "name slug description cuisine images rating numReviews estimatedDeliveryTime " +
    "deliveryFee minOrder priceRange status city isFeatured location createdAt";

/** Public detail view. `stripeAccountId` and `owner` stay server-side. */
const DETAIL_FIELDS = `${LIST_FIELDS} address state zipCode phone email website openingTime closingTime socialMedia policies deliveryRadius`;

const SORTS = {
    rating: { rating: -1, numReviews: -1 },
    deliveryFee: { deliveryFee: 1 },
    newest: { createdAt: -1 },
};

class RestaurantRepository {
    /**
     * Paginated, filtered listing.
     *
     * The old signature took the raw `req.query` object and spread it straight
     * into the Mongo filter after deleting three known keys. Any other query
     * parameter became a filter condition — including operator objects, since
     * Express parses `?rating[$gt]=0` into `{ $gt: '0' }`. Filters are built from
     * named, validated inputs only.
     */
    async findAll({ featured, search, cuisine, lat, lng, sort = "rating", page = 1, limit = 20 } = {}, options = {}) {
        const filter = {};

        if (!options.includeUnapproved) filter.status = "Open";
        if (featured === "true") filter.isFeatured = true;
        if (cuisine) filter.cuisine = cuisine;
        if (search) {
            // `escapeRegExp` matters: a search box is user input, and `(a+)+$`
            // pasted into an unescaped regex is a denial-of-service payload.
            const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [{ name: new RegExp(safe, "i") }, { cuisine: new RegExp(safe, "i") }];
        }

        const skip = (page - 1) * limit;

        // Geospatial search: $geoNear must be the first stage of the pipeline.
        if (typeof lat === "number" && typeof lng === "number") {
            const pipeline = [
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [lng, lat] },
                        distanceField: "distanceInMeters",
                        spherical: true,
                        query: filter,
                    },
                },
                {
                    $match: {
                        $expr: { $lte: ["$distanceInMeters", { $multiply: [{ $ifNull: ["$deliveryRadius", 5] }, 1000] }] },
                    },
                },
                { $skip: skip },
                { $limit: limit },
                { $project: this.#projection() },
            ];

            const items = await Restaurant.aggregate(pipeline);
            return { items, total: items.length, page, limit };
        }

        const [items, total] = await Promise.all([
            Restaurant.find(filter)
                .select(LIST_FIELDS)
                .sort(SORTS[sort] ?? SORTS.rating)
                .skip(skip)
                .limit(limit)
                .lean(),
            Restaurant.countDocuments(filter),
        ]);

        return { items, total, page, limit };
    }

    #projection() {
        const fields = { distanceInMeters: 1 };
        for (const field of LIST_FIELDS.split(" ")) fields[field] = 1;
        return fields;
    }

    async findById(id, options = {}) {
        const filter = { _id: id };
        if (!options.includeUnapproved) filter.status = "Open";

        const query = Restaurant.findOne(filter);
        // Ownership checks need `owner`, so internal callers opt in rather than
        // the field being exposed to every public detail request.
        return query.select(options.includeInternal ? undefined : DETAIL_FIELDS).lean();
    }

    async findByOwner(ownerId) {
        return Restaurant.findOne({ owner: ownerId }).lean();
    }

    async create(data) {
        return Restaurant.create(data);
    }

    async update(id, data) {
        return Restaurant.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    }

    async delete(id) {
        return Restaurant.findByIdAndDelete(id);
    }
}

module.exports = new RestaurantRepository();
