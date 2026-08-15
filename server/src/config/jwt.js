const jwt = require("jsonwebtoken");
const env = require("./env");

/*
 * The single place tokens are signed and verified.
 *
 * There used to be two: `config/jwt.js` and `utils/generateToken.js`, the latter
 * defaulting to the hardcoded string `'secretkey123'` when JWT_SECRET was unset —
 * as did both branches of the auth middleware. Any deployment missing the
 * variable therefore signed and accepted tokens under a secret published in this
 * repository. `config/env` now refuses to boot without a real secret, and this
 * module has no fallback.
 */

const ISSUER = "foodora-api";

const signToken = (userId, { role } = {}) =>
    jwt.sign({ sub: String(userId), role }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRE,
        issuer: ISSUER,
    });

const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET, { issuer: ISSUER });

/**
 * Reads the bearer token from an Authorization header.
 * Returns null rather than throwing so callers can distinguish "no credentials"
 * from "bad credentials".
 */
const extractBearerToken = (headerValue) => {
    if (typeof headerValue !== "string") return null;
    const [scheme, token] = headerValue.split(" ");
    if (!token || scheme.toLowerCase() !== "bearer") return null;
    return token.trim() || null;
};

module.exports = { signToken, verifyToken, extractBearerToken };
