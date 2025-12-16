const { Room } = require('colyseus');
const { GalleryState, Player } = require('../schema/GalleryState');
const MessageHandler = require('../handlers/message.handler');
const LoggerService = require('../../services/logger.service');
const SanitizerUtil = require('../../utils/sanitizer.util');
const config = require('../../config/config');

class GalleryRoom extends Room {
    
    onCreate(options) {
        // Initialize state
        this.setState(new GalleryState());
        
        // Room settings
        this.maxClients = config.maxPlayers;
        
        LoggerService.room('CREATED', this.roomId);
        
        // Update server time every second
        this.setSimulationInterval(() => {
            this.state.serverTime = Date.now();
        }, 1000);
        
        // Setup message handlers
        this.setupMessageHandlers();
    }

    setupMessageHandlers() {
        this.onMessage("move", (client, data) => {
            MessageHandler.handleMove(this, client, data);
        });
        
        this.onMessage("animation", (client, data) => {
            MessageHandler.handleAnimation(this, client, data);
        });
        
        this.onMessage("chat", (client, data) => {
            MessageHandler.handleChat(this, client, data);
        });
    }

    onJoin(client, options) {
        // Sanitize input
        const username = SanitizerUtil.sanitizeUsername(options.username || "Guest");
        const avatarURL = SanitizerUtil.sanitizeUrl(options.avatarURL || "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb"); // ✅ LẤY AVATAR URL
        
        LoggerService.player('JOINED', client.sessionId, username);
        
        // Create player
        const player = new Player();
        player.sessionId = client.sessionId;
        player.username = username;
        player.avatarURL = avatarURL; // ✅ LƯU AVATAR URL
        player.x = Math.random() * 10 - 5;
        player.y = 0;
        player.z = Math.random() * 10 - 5;
        player.rotationY = 0;
        player.animationState = "idle";
        player.isMoving = false;
        
        // Add to state
        this.state.players.set(client.sessionId, player);
        
        // Log player data
        console.log(`✅ Player data:`, {
            sessionId: client.sessionId,
            username: player.username,
            avatarURL: player.avatarURL,
            position: { x: player.x, y: player.y, z: player.z }
        });
    }

    onLeave(client, consented) {
        const player = this.state.players.get(client.sessionId);
        
        if (player) {
            LoggerService.player('LEFT', client.sessionId, player.username);
            this.state.players.delete(client.sessionId);
        }
    }

    onDispose() {
        LoggerService.room('DISPOSED', this.roomId);
    }
}

module.exports = GalleryRoom;
