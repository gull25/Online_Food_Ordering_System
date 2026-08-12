const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");
const env = require("../config/env");

const PLACEHOLDER = "no-photo.jpg";

/*
 * Every upload is normalised through sharp before it leaves the process:
 * re-encoding strips EXIF (which carries GPS coordinates from phone cameras) and
 * guarantees the bytes really are an image, whatever the client claimed the
 * mimetype was. The old code sent the raw buffer straight to Cloudinary and only
 * reached for sharp in the failure path.
 */
const PRESETS = {
    "foodora/offers": { width: 1600, height: 900, fit: "cover" },
    "foodora/banners": { width: 1600, height: 600, fit: "cover" },
    "foodora/logos": { width: 512, height: 512, fit: "contain" },
    users: { width: 512, height: 512, fit: "cover" },
    default: { width: 1000, height: 1000, fit: "inside" },
};

const normalise = async (buffer, folder) => {
    const preset = PRESETS[folder] ?? PRESETS.default;

    return sharp(buffer)
        .rotate() // Honour the EXIF orientation flag before discarding metadata.
        .resize({ ...preset, withoutEnlargement: true, background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .webp({ quality: 82 })
        .toBuffer();
};

const uploadToCloudinary = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "image", format: "webp" },
            (error, result) => (error ? reject(error) : resolve(result.secure_url)),
        );
        stream.end(buffer);
    });

/**
 * Stores an image and returns its URL.
 *
 * When Cloudinary is not configured the function returns a placeholder rather
 * than throwing, so the app is usable without credentials. It no longer returns
 * a *stock photo of a restaurant* — the old fallback handed back a fixed
 * Unsplash URL, which made a failed upload look like a successful one and left
 * unrelated imagery attached to real menu items.
 */
const uploadImage = async (fileBuffer, folder = "foodora") => {
    if (!env.cloudinaryEnabled) {
        console.warn("[Upload] Cloudinary is not configured; storing a placeholder reference.");
        return PLACEHOLDER;
    }

    const optimised = await normalise(fileBuffer, folder);

    try {
        return await uploadToCloudinary(optimised, folder);
    } catch (error) {
        /*
         * The previous fallback inlined the image as a base64 data URI and stored
         * it in MongoDB. A 400x400 JPEG is ~40 KB of base64 inside the document,
         * returned in full on every list query that touches it — a slow, silent
         * way to blow past the 16 MB document limit and bloat every response.
         * A transient CDN failure is reported instead.
         */
        console.error("[Upload] Cloudinary upload failed:", error.message);
        throw Object.assign(new Error("Image upload failed. Please try again."), { statusCode: 502 });
    }
};

/**
 * Removes an image from Cloudinary. Best-effort: callers treat cleanup failures
 * as non-fatal, since the user-visible write has already succeeded.
 */
const deleteImage = async (imageUrl) => {
    if (!imageUrl || !env.cloudinaryEnabled) return;
    if (imageUrl === PLACEHOLDER || imageUrl.startsWith("data:")) return;
    if (!imageUrl.includes("res.cloudinary.com")) return;

    try {
        /*
         * Derives the full public id, including nested folders.
         *
         * The old version took only the last two path segments, so an asset in
         * `foodora/menu/abc` yielded the public id `menu/abc` — which does not
         * exist. Every delete silently no-opped and the assets accumulated.
         */
        const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
        if (!match) return;

        const publicId = match[1].replace(/\.[a-z0-9]+$/i, "");
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("[Upload] Failed to delete image:", error.message);
    }
};

module.exports = { uploadImage, deleteImage, PLACEHOLDER };
