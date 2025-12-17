// config/config.js
require('dotenv').config();

module.exports = {
    // Server
    env: process.env.NODE_ENV || 'development',
    
    // Port
    port: parseInt(process.env.PORT) || 2567,
    
    // Host
    host: process.env.HOST || '0.0.0.0',
    
    // CORS
    corsOrigin: process.env.CORS_ORIGIN || '*',
    
    // Colyseus
    maxPlayers: parseInt(process.env.MAX_PLAYERS) || 50,
    roomName: process.env.ROOM_NAME || 'gallery',
    
    // JWT
    jwtSecret: process.env.JWT_SECRET || 'art-gallery-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    
    // Session
    sessionSecret: process.env.SESSION_SECRET || 'art-gallery-session-secret',
    
    // Admin user default (để tạo admin đầu tiên)
    defaultAdminUser: process.env.DEFAULT_ADMIN_USER || 'admin',
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    
    // Spawn positions
    spawnPositions: [
        { x: -2, y: 0, z: 5 },
        { x: 0, y: 0, z: 5 },
        { x: 2, y: 0, z: 5 },
    ]
};