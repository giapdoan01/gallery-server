const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const config = require('./config/config');
const loggerMiddleware = require('./middleware/logger.middleware');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/error.middleware');
const apiRoutes = require('./routes');
const adminRoutes = require('./routes/admin.routes');
const ResponseUtil = require('./utils/response.util');

/**
 * Create Express App
 */
function createApp() {
    const app = express();

    // Body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Session and flash messages
    app.use(session({
        secret: process.env.SESSION_SECRET || 'art-gallery-session-secret',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: config.env === 'production' }
    }));
    app.use(flash());

    // Set view engine TRƯỚC helmet để tránh xung đột
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(expressLayouts);
    app.set('layout', 'layouts/admin-layout');
    
    // Serve static files TRƯỚC helmet để tránh bị chặn
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Security middleware - Cấu hình để cho phép CSS và JS từ CDN
    app.use(helmet({
        contentSecurityPolicy: false, // Tắt CSP tạm thời để debug
    }));

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

    // Root endpoint
    app.get('/', (req, res) => {
        return ResponseUtil.success(res, {
            message: '🎨 Gallery Multiplayer Server',
            version: '1.0.0',
            environment: config.env,
            endpoints: {
                api: '/api',
                rooms: '/api/rooms',
                stats: '/api/rooms/stats',
                available: '/api/rooms/available',
                admin: '/admin'
            }
        }, 'Server is running');
    });

    // API routes
    app.use('/api', apiRoutes);
    
    // Admin routes
    app.use('/admin', adminRoutes);

    // 404 handler
    app.use(notFoundMiddleware);

    // Error handler
    app.use(errorMiddleware);

    return app;
}

module.exports = createApp;