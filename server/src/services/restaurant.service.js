const mongoose = require("mongoose");

const restaurantRepository = require("../repositories/restaurant.repository");
const menuItemRepository = require("../repositories/menuItem.repository");
const Category = require("../models/category.model");
const Offer = require("../models/offer.model");
const MenuItem = require("../models/menuItem.model");
const ApiError = require("../utils/ApiError");
const { geocodeAddress } = require("../utils/geocoder");
const { deleteImage } = require("./upload.service");

class RestaurantService {
    async getRestaurants(query, options) {
        return restaurantRepository.findAll(query, options);
    }

    /**
     * Restaurant detail.
     *
     * The old signature was `getRestaurantDetails(id)` while the controller
     * called it as `getRestaurantDetails(id, options)` — so `includeUnapproved`
     * was silently dropped and the repository always filtered on
     * `status: 'Open'`. An owner who closed their restaurant for the evening got
     * a 404 on their own management screens and could not reopen it.
     */
    async getRestaurantDetails(id, options = {}) {
        const restaurant = await restaurantRepository.findById(id, options);
        if (!restaurant) throw new ApiError(404, "Restaurant not found");
        return restaurant;
    }

    async getRestaurantMenu(restaurantId, options = {}) {
        const restaurant = await restaurantRepository.findById(restaurantId, options);
        if (!restaurant) throw new ApiError(404, "Restaurant not found");

        return menuItemRepository.findByRestaurant(restaurantId, options);
    }

    /**
     * Creates the caller's restaurant.
     *
     * `owner` comes from the session. The controller previously wrote
     * `req.body.owner = req.body.owner || req.user.id`, so a request that
     * included an `owner` field created a restaurant registered to somebody
     * else's account.
     */
    async createRestaurant(ownerId, data, images = {}) {
        const existing = await restaurantRepository.findByOwner(ownerId);
        if (existing) {
            // One restaurant per owner: the whole admin surface resolves the
            // owner's restaurant with `findOne({ owner })`, so a second one would
            // be invisible and unmanageable.
            throw new ApiError(409, "You already have a restaurant. Edit it from your dashboard.");
        }

        const location = await this.#geocode(data);

        return restaurantRepository.create({
            ...data,
            owner: ownerId,
            ...(Object.keys(images).length ? { images } : {}),
            ...(location ? { location } : {}),
        });
    }

    /**
     * Updates a restaurant.
     *
     * `images` is merged with dot-notation rather than replaced. The controller
     * used to set `req.body.images = req.body.images || {}` on every request;
     * with multipart bodies that is always `{}`, so `findByIdAndUpdate` reset the
     * whole subdocument to its defaults — saving any field on the settings form
     * silently wiped the restaurant's logo and banner back to `no-photo.jpg`.
     */
    async updateRestaurant(id, data, images = {}) {
        const existing = await restaurantRepository.findById(id, { includeUnapproved: true, includeInternal: true });
        if (!existing) throw new ApiError(404, "Restaurant not found");

        const location = await this.#geocode({ ...existing, ...data });

        const update = { ...data, ...(location ? { location } : {}) };
        for (const [key, value] of Object.entries(images)) {
            update[`images.${key}`] = value;
        }

        const updated = await restaurantRepository.update(id, update);

        // Replaced artwork is removed from the CDN afterwards — an orphaned asset
        // per edit adds up, and this is safe to do only once the write succeeded.
        for (const key of Object.keys(images)) {
            const previous = existing.images?.[key];
            if (previous && previous !== images[key] && previous !== "no-photo.jpg") {
                deleteImage(previous).catch(() => {});
            }
        }

        return updated;
    }

    /**
     * Deletes a restaurant and everything that belongs to it.
     *
     * Deleting only the restaurant document left its menu items, categories and
     * offers behind as unreachable rows that still surfaced through
     * `/api/public/trending` and `/api/offers/active`, pointing at a restaurant
     * that no longer existed.
     */
    async deleteRestaurant(id) {
        const restaurant = await restaurantRepository.findById(id, { includeUnapproved: true });
        if (!restaurant) throw new ApiError(404, "Restaurant not found");

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                await Promise.all([
                    MenuItem.deleteMany({ restaurant: id }, { session }),
                    Category.deleteMany({ restaurantId: id }, { session }),
                    Offer.deleteMany({ restaurantId: id }, { session }),
                ]);
                await restaurantRepository.delete(id);
            });
        } catch (error) {
            // Standalone mongod has no transaction support; fall back to a
            // best-effort sequential cleanup rather than failing the request.
            if (error.code === 20 || /Transaction numbers|replica set/i.test(error.message)) {
                await Promise.all([
                    MenuItem.deleteMany({ restaurant: id }),
                    Category.deleteMany({ restaurantId: id }),
                    Offer.deleteMany({ restaurantId: id }),
                ]);
                await restaurantRepository.delete(id);
            } else {
                throw error;
            }
        } finally {
            await session.endSession();
        }

        return {};
    }

    async createMenuItem(restaurantId, data, image) {
        const restaurant = await restaurantRepository.findById(restaurantId, { includeUnapproved: true });
        if (!restaurant) throw new ApiError(404, "Restaurant not found");

        // A menu item pointing at another restaurant's category would render
        // under a heading the owner does not control.
        await this.#assertCategoryBelongsTo(data.category, restaurantId);

        return menuItemRepository.create({
            ...data,
            restaurant: restaurantId,
            ...(image ? { image } : {}),
        });
    }

    async updateMenuItem(menuId, data, image) {
        const menuItem = await menuItemRepository.findById(menuId);
        if (!menuItem) throw new ApiError(404, "Menu item not found");

        if (data.category) {
            await this.#assertCategoryBelongsTo(data.category, menuItem.restaurant);
        }

        const updated = await menuItemRepository.update(menuId, { ...data, ...(image ? { image } : {}) });

        if (image && menuItem.image && menuItem.image !== "no-photo.jpg" && menuItem.image !== image) {
            deleteImage(menuItem.image).catch(() => {});
        }

        return updated;
    }

    async deleteMenuItem(menuId) {
        const menuItem = await menuItemRepository.findById(menuId);
        if (!menuItem) throw new ApiError(404, "Menu item not found");

        await menuItemRepository.delete(menuId);

        if (menuItem.image && menuItem.image !== "no-photo.jpg") {
            deleteImage(menuItem.image).catch(() => {});
        }

        return {};
    }

    async #assertCategoryBelongsTo(categoryId, restaurantId) {
        const category = await Category.findOne({ _id: categoryId, restaurantId }).select("_id").lean();
        if (!category) throw new ApiError(400, "That category does not belong to this restaurant");
    }

    async #geocode({ address, city, state, zipCode }) {
        if (!address || !city) return null;

        const coords = await geocodeAddress(`${address}, ${city}, ${state ?? ""} ${zipCode ?? ""}`.trim());
        if (!coords) return null;

        // GeoJSON is [longitude, latitude] — the opposite of how humans say it.
        return { type: "Point", coordinates: [coords.lng, coords.lat] };
    }
}

module.exports = new RestaurantService();
