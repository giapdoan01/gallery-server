const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const loggerMiddleware = require('./middleware/logger.middleware');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/error.middleware');
const apiRoutes = require('./routes');

function createApp() {
    const app = express();

    // Body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Security
    app.use(helmet({ contentSecurityPolicy: false }));

    // CORS
    app.use(cors({
        origin: config.corsOrigin,
        credentials: true
    }));

    // Logging
    if (config.env === 'development') {
        app.use(morgan('dev'));
    }
    app.use(loggerMiddleware);

    // API routes
    app.use('/api', apiRoutes);

    // 404 handler
    app.use(notFoundMiddleware);

    // Error handler
    app.use(errorMiddleware);

    return app;
}

module.exports = createApp;
