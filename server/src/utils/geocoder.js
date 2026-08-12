const axios = require("axios");
const env = require("../config/env");

/*
 * Nominatim's usage policy caps callers at one request per second and requires a
 * genuine User-Agent. The previous implementation sent a placeholder address, had
 * no timeout, and issued a request per order — so a burst of checkouts breached
 * the policy, and a slow or hanging response held the order request open
 * indefinitely with no ceiling.
 *
 * A small in-process cache and a short timeout address both: repeat addresses
 * (a customer's home, a restaurant being edited) never leave the process, and a
 * slow provider degrades to the default map centre instead of stalling checkout.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;
const REQUEST_TIMEOUT_MS = 4000;

const cache = new Map();

const readCache = (key) => {
    const entry = cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.at > CACHE_TTL_MS) {
        cache.delete(key);
        return undefined;
    }

    // Refresh recency so the eviction below is least-recently-used.
    cache.delete(key);
    cache.set(key, entry);
    return entry.value;
};

const writeCache = (key, value) => {
    if (cache.size >= CACHE_MAX_ENTRIES) {
        cache.delete(cache.keys().next().value);
    }
    cache.set(key, { value, at: Date.now() });
};

/**
 * Resolves an address to coordinates.
 *
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number}|null>} null when it cannot be resolved.
 */
const geocodeAddress = async (address) => {
    const key = String(address ?? "").trim().toLowerCase();
    if (!key) return null;

    const cached = readCache(key);
    if (cached !== undefined) return cached;

    try {
        const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: { q: address, format: "json", limit: 1 },
            headers: { "User-Agent": env.GEOCODER_USER_AGENT },
            timeout: REQUEST_TIMEOUT_MS,
        });

        const first = Array.isArray(data) ? data[0] : null;
        const result = first ? { lat: Number.parseFloat(first.lat), lng: Number.parseFloat(first.lon) } : null;

        writeCache(key, result);
        return result;
    } catch (error) {
        console.error("[Geocoder] Lookup failed:", error.message);
        // Deliberately not cached: a timeout is transient and should be retried.
        return null;
    }
};

module.exports = { geocodeAddress };
