const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const loggerMiddleware = require('./middleware/logger.middleware');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/error.middleware');
const apiRoutes = require('./routes');
const ResponseUtil = require('./utils/response.util');

/**
 * Create Express App
 */
function createApp() {
    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS
    app.use(cors({
        origin: config.corsOrigin,
        credentials: true
    }));

    // Body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Logging
    if (config.env === 'development') {
        app.use(morgan('dev'));
    }
    app.use(loggerMiddleware);

    // Root endpoint
    app.get('/', (req, res) => {
        return ResponseUtil.success(res, {
            message: '🎨 Gallery Multiplayer Server',
            version: '1.0.0',
            environment: config.env,
            endpoints: {
                api: '/api',
                health: '/api/health',
                rooms: '/api/rooms',
                stats: '/api/rooms/stats',
                available: '/api/rooms/available',
                monitor: '/monitor'
            }
        }, 'Server is running');
    });

    // ✅ API routes (QUAN TRỌNG)
    app.use('/api', apiRoutes);

    // 404 handler
    app.use(notFoundMiddleware);

    // Error handler
    app.use(errorMiddleware);

    return app;
}

module.exports = createApp;
