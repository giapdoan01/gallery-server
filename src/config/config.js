require('dotenv').config();

module.exports = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 2567,
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    maxPlayers: parseInt(process.env.MAX_PLAYERS) || 50,
    roomName: process.env.ROOM_NAME || 'gallery',
    adminRoomName: process.env.ADMIN_ROOM_NAME || 'admingallery',
    spawnPositions: [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 },
    ]
};
