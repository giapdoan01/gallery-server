const LoggerService = require('../services/logger.service');
const ResponseUtil = require('../utils/response.util');

/**
 * Error Handler Middleware
 */
function errorMiddleware(err, req, res, next) {
    LoggerService.error('Error:', err.message);
    
    if (process.env.NODE_ENV === 'development') {
        LoggerService.error('Stack:', err.stack);
    }
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    return ResponseUtil.error(res, message, statusCode);
}

/**
 * 404 Not Found Middleware
 */
function notFoundMiddleware(req, res) {
    return ResponseUtil.notFound(res, `Route ${req.method} ${req.path} not found`);
}

module.exports = {
    errorMiddleware,
    notFoundMiddleware
};
