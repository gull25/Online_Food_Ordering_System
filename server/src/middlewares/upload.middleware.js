const multer = require("multer");
const ApiError = require("../utils/ApiError");

/*
 * Uploads are held in memory and streamed to Cloudinary, so the size limit is
 * also a memory-pressure limit: with the previous 20 MB cap, a handful of
 * concurrent uploads could exhaust the heap. 5 MB is generous for the product
 * photography these endpoints accept.
 */
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

const fileFilter = (req, file, cb) => {
    /*
     * An explicit allowlist, not `mimetype.startsWith('image')`.
     *
     * `image/svg+xml` starts with "image" and passes that check, but SVG is an
     * XML document that can carry <script> — serving one back from a CDN under a
     * URL the app renders is stored XSS. The client also sets the mimetype, so
     * this is a first filter rather than a guarantee; Cloudinary re-encodes what
     * it accepts, which is what actually settles the file's type.
     */
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);

    cb(new ApiError(400, "Only JPEG, PNG, WebP, AVIF or GIF images are accepted"));
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: MAX_BYTES,
        files: 2,
        // Caps the non-file parts of a multipart body, which are otherwise
        // unbounded even though `express.json` is limited.
        fields: 40,
        fieldSize: 100 * 1024,
    },
});

module.exports = upload;
module.exports.MAX_BYTES = MAX_BYTES;
