// server.js
const { createServer } = require('http');
const { Server } = require('colyseus');
const { monitor } = require('@colyseus/monitor');
const createApp = require('./app');
const config = require('./config/config');
const GalleryRoom = require('./colyseus/rooms/GalleryRoom');
const LoggerService = require('./services/logger.service');
const RoomService = require('./services/room.service');

/**
 * Start Server
 */
async function startServer() {
    try {
        // 1. Create Express app
        const app = createApp();

        // 2. Create HTTP server
        const httpServer = createServer(app);

        // 3. Create Colyseus server
        const gameServer = new Server({
            server: httpServer,
            express: app
        });

        LoggerService.success('Colyseus server created');

        // 4. Set game server to RoomService
        RoomService.setGameServer(gameServer);

        // 5. Register Colyseus room
        gameServer.define(config.roomName, GalleryRoom);
        LoggerService.success(`Room "${config.roomName}" registered`);

        // 6. Colyseus monitor
        app.use('/monitor', monitor());
        LoggerService.success('Monitor enabled at /monitor');

        // 7. Health check endpoint (QUAN TRỌNG cho Render)
        app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                uptime: process.uptime(),
                timestamp: Date.now(),
                environment: config.env,
                totalRooms: gameServer.rooms.size,
                port: config.port
            });
        });

        // 8. Root endpoint
        app.get('/', (req, res) => {
            res.json({
                message: '🎨 Gallery Multiplayer Server',
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    health: '/health',
                    api: '/api',
                    monitor: '/monitor',
                    websocket: req.protocol === 'https' 
                        ? 'wss://' + req.get('host') 
                        : 'ws://' + req.get('host')
                }
            });
        });

        // ✅ 9. QUAN TRỌNG: Listen trên port
        const port = config.port;
        const host = '0.0.0.0';
        
        httpServer.listen(port, host, () => {
            const isProduction = config.env === 'production';
            
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎨 GALLERY MULTIPLAYER SERVER                      ║
║                                                       ║
║   Environment: ${config.env.padEnd(36)}║
║   Port: ${port.toString().padEnd(42)}║
║   Host: ${host.padEnd(42)}║
║                                                       ║`);

            if (isProduction) {
                console.log(`║   🌐 Production Mode                                  ║`);
            } else {
                console.log(`║   🌐 API: http://localhost:${port}/api${' '.repeat(24)}║
║   📊 Monitor: http://localhost:${port}/monitor${' '.repeat(18)}║
║   🎮 WebSocket: ws://localhost:${port}${' '.repeat(22)}║`);
            }

            console.log(`║                                                       ║
║   📡 Room: "${config.roomName}" (max ${config.maxPlayers} players)${' '.repeat(14)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
            `);

            LoggerService.success(`✅ Server is listening on ${host}:${port}`);
            LoggerService.success('✅ Server is ready!');
        });

        // 10. Error handling for server
        httpServer.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                LoggerService.error(`❌ Port ${port} is already in use`);
            } else {
                LoggerService.error('❌ Server error:', error.message);
            }
            process.exit(1);
        });

        // 11. Graceful shutdown
        process.on('SIGTERM', async () => {
            LoggerService.warning('⚠️  SIGTERM received, shutting down gracefully...');
            await gameServer.gracefullyShutdown();
            httpServer.close(() => {
                LoggerService.success('✅ Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            LoggerService.warning('⚠️  SIGINT received, shutting down gracefully...');
            await gameServer.gracefullyShutdown();
            httpServer.close(() => {
                LoggerService.success('✅ Server closed');
                process.exit(0);
            });
        });

        // 12. Unhandled errors
        process.on('unhandledRejection', (reason, promise) => {
            LoggerService.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
        });

        process.on('uncaughtException', (error) => {
            LoggerService.error('❌ Uncaught Exception:', error);
            process.exit(1);
        });

    } catch (error) {
        LoggerService.error('❌ Failed to start server:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Start server
startServer();
