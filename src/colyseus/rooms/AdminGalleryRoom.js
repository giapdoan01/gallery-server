const { Room } = require('colyseus');
const { GalleryState, Player } = require('../schema/GalleryState');
const MessageHandler = require('../handlers/message.handler');
const LoggerService = require('../../services/logger.service');
const SanitizerUtil = require('../../utils/sanitizer.util');
const config = require('../../config/config');

class AdminGalleryRoom extends Room {
    
    onCreate(options) {
        // Initialize state - sử dụng cùng state với GalleryRoom
        this.setState(new GalleryState());
        
        // Room settings - giới hạn 3 admin
        this.maxClients = 3;
        
        LoggerService.room('ADMIN ROOM CREATED', this.roomId);
        
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

        // Admin message handlers
        this.onMessage("kickUser", (client, data) => {
            this.handleKickUser(client, data);
        });
        
        this.onMessage("banUser", (client, data) => {
            this.handleBanUser(client, data);
        });
    }

    handleKickUser(client, data) {
        const admin = this.state.players.get(client.sessionId);
        LoggerService.room('ADMIN KICK USER', `Admin ${admin.username} kicked user ${data.userId}`);
        
        // Xử lý kick user - cần thêm logic để kết nối với gallery room
        this.broadcast("userKicked", {
            userId: data.userId,
            adminId: client.sessionId,
            reason: data.reason || "No reason provided"
        });
    }
    
    handleBanUser(client, data) {
        const admin = this.state.players.get(client.sessionId);
        LoggerService.room('ADMIN BAN USER', `Admin ${admin.username} banned user ${data.userId}`);
        
        // Xử lý ban user - cần thêm logic để lưu danh sách cấm
        this.broadcast("userBanned", {
            userId: data.userId,
            adminId: client.sessionId,
            duration: data.duration || "permanent",
            reason: data.reason || "No reason provided"
        });
    }

    onJoin(client, options) {
        // Sanitize input
        const username = SanitizerUtil.sanitizeUsername(options.username || "Admin");
        const avatarURL = SanitizerUtil.sanitizeUrl(options.avatarURL || "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb");
        
        LoggerService.player('ADMIN JOINED', client.sessionId, username);
        
        // Create player
        const player = new Player();
        player.sessionId = client.sessionId;
        player.username = "[ADMIN] " + username; // Đánh dấu là admin
        player.avatarURL = avatarURL;
        player.x = Math.random() * 10 - 5;
        player.y = 0;
        player.z = Math.random() * 10 - 5;
        player.rotationY = 0;
        player.animationState = "idle";
        player.isMoving = false;
        
        // Add to state
        this.state.players.set(client.sessionId, player);
        
        // Log player data
        console.log(`✅ Admin joined:`, {
            sessionId: client.sessionId,
            username: player.username,
            avatarURL: player.avatarURL
        });
    }

    onLeave(client, consented) {
        const player = this.state.players.get(client.sessionId);
        
        if (player) {
            LoggerService.player('ADMIN LEFT', client.sessionId, player.username);
            this.state.players.delete(client.sessionId);
        }
    }

    onDispose() {
        LoggerService.room('ADMIN ROOM DISPOSED', this.roomId);
    }
}

module.exports = AdminGalleryRoom;