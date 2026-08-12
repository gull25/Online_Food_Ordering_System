/*
 * Request validation.
 *
 * The old middleware called `schema.parse(req.body)` and threw the result away,
 * letting the *unvalidated* body continue to the controller. Because most
 * controllers hand `req.body` straight to Mongoose, that made every write
 * endpoint a mass-assignment hole: `POST /api/auth/register` with
 * `{"role":"restaurant_admin"}` created a privileged account even though the
 * register schema has no `role` field, and `PUT /api/restaurants/:id` with
 * `{"isFeatured":true,"rating":5}` let an owner promote their own listing.
 *
 * Writing the parsed value back is what closes that: Zod objects strip unknown
 * keys by default, so a controller can only ever see fields the schema declares.
 * Coercions (string → number for query params, trimming, lowercasing) also
 * survive, which removes a lot of ad-hoc parsing from the controllers.
 */

const TARGETS = ["body", "query", "params"];

const validate = (schemas) => (req, res, next) => {
    try {
        for (const target of TARGETS) {
            const schema = schemas[target];
            if (!schema) continue;

            const parsed = schema.parse(req[target]);

            /*
             * Express 5 exposes `req.query` as a prototype getter with no
             * setter, so a plain assignment is silently discarded in sloppy
             * mode — the controller would keep reading the raw values. Defining
             * an own property shadows the getter and makes the write stick.
             */
            if (target === "query") {
                Object.defineProperty(req, "query", {
                    value: parsed,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            } else {
                req[target] = parsed;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = validate;
