const LoggerService = require('../services/logger.service');

/**
 * Request Logger Middleware
 */
function loggerMiddleware(req, res, next) {
    const start = Date.now();
    
    // Log request
    LoggerService.info(`${req.method} ${req.path}`);
    
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusColor = res.statusCode >= 400 ? '❌' : '✅';
        LoggerService.info(
            `${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
        );
    });
    
    next();
}

module.exports = loggerMiddleware;
