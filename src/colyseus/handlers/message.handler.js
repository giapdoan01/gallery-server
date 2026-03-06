const LoggerService = require('../../services/logger.service');
const SanitizerUtil = require('../../utils/sanitizer.util');

class MessageHandler {

    static handleMove(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }

        if (data.x !== undefined && !isNaN(data.x)) player.x = data.x;
        if (data.y !== undefined && !isNaN(data.y)) player.y = data.y;
        if (data.z !== undefined && !isNaN(data.z)) player.z = data.z;
        if (data.rotationY !== undefined && !isNaN(data.rotationY)) player.rotationY = data.rotationY;

        // Auto animation từ speed (nếu client gửi kèm)
        if (data.speed !== undefined && !isNaN(data.speed)) {
            const speed = data.speed;
            player.isMoving = speed > 0.1;
            player.animationState = speed > 0.1 ? "walk" : "idle";
        }
    }

    static handleAnimation(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }

        // Chỉ cho phép "idle" hoặc "walk"
        const allowed = ["idle", "walk"];
        if (data.state && typeof data.state === 'string' && allowed.includes(data.state)) {
            player.animationState = data.state;
            player.isMoving = data.state === "walk";
            // LoggerService.player('ANIMATION', player.username, data.state);
        }
    }

    static handleChat(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }

        if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
            console.warn(`⚠️ Invalid chat message from ${player.username}`);
            return;
        }

        const message = SanitizerUtil.sanitizeText(data.message.trim().substring(0, 500));

        room.broadcast("chatMessage", {
            sessionId: client.sessionId,
            username:  player.username,
            message:   message,
            timestamp: Date.now()
        });

        LoggerService.player('CHAT', player.username, `"${message}"`);
    }

    static handleEmote(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        if (!player) return;

        if (!data.type || typeof data.type !== 'string') return;

        room.broadcast("playerEmote", {
            sessionId: client.sessionId,
            username:  player.username,
            emoteType: data.type
        }, { except: client });

        LoggerService.player('EMOTE', player.username, data.type);
    }
}

module.exports = MessageHandler;