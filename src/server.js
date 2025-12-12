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

        // 7. Start server
        httpServer.listen(config.port, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎨 GALLERY MULTIPLAYER SERVER                      ║
║                                                       ║
║   Environment: ${config.env.padEnd(36)}║
║   Port: ${config.port.toString().padEnd(42)}║
║                                                       ║
║   🌐 API: http://${config.host}:${config.port}/api${' '.repeat(21)}║
║   📊 Monitor: http://${config.host}:${config.port}/monitor${' '.repeat(15)}║
║   🎮 WebSocket: ws://${config.host}:${config.port}${' '.repeat(19)}║
║                                                       ║
║   📡 Room: "${config.roomName}" (max ${config.maxPlayers} players)${' '.repeat(14)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
            `);

            LoggerService.success('Server is ready!');
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            LoggerService.warning('SIGTERM received, shutting down...');
            await gameServer.gracefullyShutdown();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            LoggerService.warning('SIGINT received, shutting down...');
            await gameServer.gracefullyShutdown();
            process.exit(0);
        });

    } catch (error) {
        LoggerService.error('Failed to start server:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Start server
startServer();
