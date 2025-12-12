// config/config.js
require('dotenv').config();

module.exports = {
    // Server
    env: process.env.NODE_ENV || 'development',
    
    // ✅ Render sẽ tự động set PORT, không dùng 2567
    port: parseInt(process.env.PORT) || 2567,
    
    // ✅ Đổi từ 'localhost' → '0.0.0.0' để Render có thể access
    host: process.env.HOST || '0.0.0.0',
    
    // CORS
    corsOrigin: process.env.CORS_ORIGIN || '*',
    
    // Colyseus
    maxPlayers: parseInt(process.env.MAX_PLAYERS) || 50,
    roomName: process.env.ROOM_NAME || 'gallery',
    
    // Spawn positions
    spawnPositions: [
        { x: -2, y: 0, z: 5 },
        { x: 0, y: 0, z: 5 },
        { x: 2, y: 0, z: 5 },
    ]
};
