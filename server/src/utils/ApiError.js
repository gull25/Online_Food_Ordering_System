/**
 * An error carrying an HTTP status the client is meant to see.
 *
 * The distinction matters to the error middleware: an `ApiError` is a deliberate,
 * user-facing message, while anything else is an internal fault whose message is
 * logged but replaced with a generic 500 in the response.
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode
     * @param {string} message  Safe to show a user.
     * @param {Array<{field: string, message: string}>} [details]  Field-level errors.
     */
    constructor(statusCode, message, details) {
        super(message);

        this.name = "ApiError";
        this.statusCode = statusCode;
        if (details) this.details = details;

        // Keeps this constructor out of the stack trace, so the top frame is the
        // line that actually threw.
        Error.captureStackTrace?.(this, ApiError);
    }
}

module.exports = ApiError;
