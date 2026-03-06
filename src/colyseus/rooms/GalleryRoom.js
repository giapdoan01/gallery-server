const { Room } = require('colyseus');
const { GalleryState, Player } = require('../schema/GalleryState');
const MessageHandler = require('../handlers/message.handler');
const LoggerService = require('../../services/logger.service');
const SanitizerUtil = require('../../utils/sanitizer.util');
const config = require('../../config/config');

// ✅ Số lượng prefab avatar có trong Unity (index 0 → AVATAR_COUNT - 1)
const AVATAR_COUNT = 5;

class GalleryRoom extends Room {

    onCreate(options) {
        this.setState(new GalleryState());
        this.maxClients = config.maxPlayers;

        LoggerService.room('CREATED', this.roomId);

        this.setSimulationInterval(() => {
            this.state.serverTime = Date.now();
        }, 1000);

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
        const username = SanitizerUtil.sanitizeUsername(options.username || "Guest");

        // ✅ Nhận avatarIndex từ client, validate trong khoảng [0, AVATAR_COUNT - 1]
        let avatarIndex = parseInt(options.avatarIndex ?? 0);
        if (isNaN(avatarIndex) || avatarIndex < 0 || avatarIndex >= AVATAR_COUNT) {
            avatarIndex = 0;
        }

        LoggerService.player('JOINED', client.sessionId, username);

        const player = new Player();
        player.sessionId  = client.sessionId;
        player.username   = username;
        player.avatarIndex = avatarIndex; // ✅ Lưu index prefab
        player.x          = 0;
        player.y          = 0;
        player.z          = 0;
        player.rotationY  = 0;
        player.animationState = "idle";
        player.isMoving   = false;

        this.state.players.set(client.sessionId, player);

        console.log(`✅ Player joined:`, {
            sessionId:   client.sessionId,
            username:    player.username,
            avatarIndex: player.avatarIndex,
            position:    { x: player.x, y: player.y, z: player.z }
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