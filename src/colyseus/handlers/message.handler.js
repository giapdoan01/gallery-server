const LoggerService = require('../../services/logger.service');
const SanitizerUtil = require('../../utils/sanitizer.util');

class MessageHandler {

    static handleMove(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }
        
        if (data.x !== undefined && !isNaN(data.x)) {
            player.x = data.x;
        }
        
        if (data.y !== undefined && !isNaN(data.y)) {
            player.y = data.y;
        }
        
        if (data.z !== undefined && !isNaN(data.z)) {
            player.z = data.z;
        }
        
        if (data.rotationY !== undefined && !isNaN(data.rotationY)) {
            player.rotationY = data.rotationY;
        }
        
        if (player.speed !== undefined && data.speed !== undefined) {
            player.speed = data.speed;
            
            // Auto update animation based on speed
            if (player.animationState !== undefined) {
                if (player.speed > 0.1) {
                    player.animationState = player.speed > 4 ? "running" : "walking";
                } else {
                    player.animationState = "idle";
                }
            }
        }
    }

    static handleAnimation(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }
        
        // ✅ GIỮ NGUYÊN LOGIC CŨ - Chỉ check data.state
        if (data.state && typeof data.state === 'string') {
            player.animationState = data.state;
            LoggerService.player('ANIMATION', player.username, data.state);
        }
    }

    // ✅ THÊM MỚI - CHAT HANDLER
    static handleChat(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }
        
        // Validate message
        if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
            console.warn(`⚠️ Invalid chat message from ${player.username}`);
            return;
        }
        
        // Sanitize message
        const message = SanitizerUtil.sanitizeText(data.message.trim().substring(0, 500));
        
        // Broadcast to all clients
        room.broadcast("chatMessage", {
            sessionId: client.sessionId,
            username: player.username,
            message: message,
            timestamp: Date.now()
        });
        
        LoggerService.player('CHAT', player.username, `"${message}"`);
    }

    static handleEmote(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }
        
        // Validate emote type
        if (!data.type || typeof data.type !== 'string') {
            return;
        }
        
        // Broadcast to other players
        room.broadcast("playerEmote", {
            sessionId: client.sessionId,
            username: player.username,
            emoteType: data.type
        }, { except: client });
        
        LoggerService.player('EMOTE', player.username, data.type);
    }

    static handleViewArtwork(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }
        
        // Update viewing state
        if (data.artworkId && typeof data.artworkId === 'string') {
            player.currentArtwork = data.artworkId;
            player.isViewing = true;
            
            LoggerService.player('VIEW', player.username, `Artwork: ${data.artworkId}`);
            
            // Broadcast to others
            room.broadcast("playerViewingArtwork", {
                sessionId: client.sessionId,
                username: player.username,
                artworkId: data.artworkId
            }, { except: client });
        }
    }

    static handleStopViewing(room, client, data) {
        const player = room.state.players.get(client.sessionId);
        
        if (!player) {
            console.warn(`⚠️ Player not found: ${client.sessionId}`);
            return;
        }
        
        // Clear viewing state
        player.currentArtwork = "";
        player.isViewing = false;
        
        LoggerService.player('STOP_VIEW', player.username, '');
        
        // Broadcast to others
        room.broadcast("playerStoppedViewing", {
            sessionId: client.sessionId,
            username: player.username
        }, { except: client });
    }
}

module.exports = MessageHandler;
