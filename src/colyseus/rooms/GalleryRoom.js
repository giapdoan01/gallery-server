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
        
        this.onMessage("emote", (client, data) => {
            MessageHandler.handleEmote(this, client, data);
        });
        
        this.onMessage("viewArtwork", (client, data) => {
            MessageHandler.handleViewArtwork(this, client, data);
        });
        
        this.onMessage("stopViewing", (client, data) => {
            MessageHandler.handleStopViewing(this, client, data);
        });
    }

    onJoin(client, options) {
        console.log('📦 Options received:', JSON.stringify(options));
        
        LoggerService.player('JOINING', options.username || options.name || 'Guest', `(${client.sessionId})`);
        
        // Create player
        const player = new Player();
        player.sessionId = client.sessionId; 
        
        player.username = SanitizerUtil.sanitizeName(
            options.username || options.name || `Guest_${Math.floor(Math.random() * 10000)}`
        );
        
        player.avatarIndex = options.avatarIndex || 0;
        
        console.log(`👤 Player created: ${player.username} (Avatar: ${player.avatarIndex})`);
        
        // Set spawn position
        const spawnPos = this.getSpawnPosition();
        player.x = spawnPos.x;
        player.y = spawnPos.y;
        player.z = spawnPos.z;
        player.rotationY = Math.random() * 360;
        
        player.currentArtwork = "";
        player.isViewing = false;
        
        // Add to state
        this.state.players.set(client.sessionId, player);
        
        // Send welcome message
        client.send("welcome", {
            message: `Chào mừng ${player.username} đến phòng tranh!`,
            totalPlayers: this.state.players.size,
            roomId: this.roomId
        });
        
        // Broadcast to others
        this.broadcast("playerJoined", {
            sessionId: client.sessionId, 
            username: player.username,     
            avatarIndex: player.avatarIndex
        }, { except: client });
        
        LoggerService.success(
            `${player.username} joined! (${this.state.players.size}/${this.maxClients})`
        );
    }

    onLeave(client, consented) {
        const player = this.state.players.get(client.sessionId);
        
        if (!player) return;
        
        LoggerService.player('LEAVING', player.username, consented ? 'consented' : 'disconnected');
        
        // Calculate session duration
        const duration = Date.now() - (player.joinedAt || Date.now());
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        LoggerService.info(`Session duration: ${minutes}m ${seconds}s`);
        
        // Remove player
        this.state.players.delete(client.sessionId);
        
        // Broadcast to others
        this.broadcast("playerLeft", {
            sessionId: client.sessionId,  
            username: player.username    
        });
        
        LoggerService.warning(
            `${player.username} left (${this.state.players.size}/${this.maxClients})`
        );
    }

    onDispose() {
        LoggerService.room('DISPOSED', this.roomId);
    }

    getSpawnPosition() {
        const positions = config.spawnPositions;
        return positions[Math.floor(Math.random() * positions.length)];
    }
}

module.exports = GalleryRoom;
