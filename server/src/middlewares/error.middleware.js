const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message;

    // Handle Zod Validation Error
    if (err.name === 'ZodError') {
        statusCode = 400;
        message = err.errors.map(e => e.message).join(', ');
    }

    res.status(statusCode).json({
        success: false,
        message: message,
    });
};

module.exports = errorHandler;
