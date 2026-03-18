require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('colyseus');
const { monitor } = require('@colyseus/monitor');
const createApp = require('./app');
const config = require('./config/config');
const GalleryRoom = require('./colyseus/rooms/GalleryRoom');
const AdminGalleryRoom = require('./colyseus/rooms/AdminGalleryRoom');
const LoggerService = require('./services/logger.service');
const RoomService = require('./services/room.service');

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

        // 5. Register Colyseus rooms
        gameServer.define(config.roomName, GalleryRoom);
        LoggerService.success(`Room "${config.roomName}" registered`);

        gameServer.define(config.adminRoomName, AdminGalleryRoom);
        LoggerService.success(`Admin Room "${config.adminRoomName}" registered`);

        // 6. Colyseus monitor
        app.use('/monitor', monitor());
        LoggerService.success('Monitor enabled at /monitor');

        // 7. Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                uptime: process.uptime(),
                timestamp: Date.now(),
                environment: config.env,
                port: config.port
            });
        });

        // 8. Root endpoint
        app.get('/', (req, res) => {
            res.json({
                message: 'Gallery Multiplayer Server',
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

        // 9. Listen
        const port = config.port;
        const host = '0.0.0.0';

        httpServer.listen(port, host, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎨 GALLERY MULTIPLAYER SERVER                      ║
║                                                       ║
║   Environment: ${config.env.padEnd(36)}║
║   Port: ${port.toString().padEnd(42)}║
║   WebSocket: ws://localhost:${port}${' '.repeat(22)}║
║   Monitor:   http://localhost:${port}/monitor${' '.repeat(18)}║
║   API:       http://localhost:${port}/api${' '.repeat(21)}║
║                                                       ║
║   Room: "${config.roomName}" (max ${config.maxPlayers} players)${' '.repeat(20)}║
║   Admin Room: "${config.adminRoomName}" (max 3 admins)${' '.repeat(13)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
            `);
            LoggerService.success(`Server is listening on ${host}:${port}`);
        });

        // 10. Error handling
        httpServer.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                LoggerService.error(`Port ${port} is already in use`);
            } else {
                LoggerService.error('Server error:', error.message);
            }
            process.exit(1);
        });

        // 11. Graceful shutdown
        const shutdown = async () => {
            LoggerService.warning('Shutting down gracefully...');
            await gameServer.gracefullyShutdown();
            httpServer.close(() => {
                LoggerService.success('Server closed');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

        // 12. Unhandled errors
        process.on('unhandledRejection', (reason) => {
            LoggerService.error('Unhandled Rejection:', reason);
        });

        process.on('uncaughtException', (error) => {
            LoggerService.error('Uncaught Exception:', error);
            process.exit(1);
        });

    } catch (error) {
        LoggerService.error('Failed to start server:', error.message);
        console.error(error);
        process.exit(1);
    }
}

startServer();
