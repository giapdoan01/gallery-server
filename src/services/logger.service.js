/**
 * Logger Service
 */
class LoggerService {
    static info(message, ...args) {
        console.log(`ℹ️  [INFO] ${message}`, ...args);
    }

    static success(message, ...args) {
        console.log(`✅ [SUCCESS] ${message}`, ...args);
    }

    static warning(message, ...args) {
        console.warn(`⚠️  [WARNING] ${message}`, ...args);
    }

    static error(message, ...args) {
        console.error(`❌ [ERROR] ${message}`, ...args);
    }

    static debug(message, ...args) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🐛 [DEBUG] ${message}`, ...args);
        }
    }

    static player(action, playerName, ...args) {
        console.log(`👤 [PLAYER] ${action}: ${playerName}`, ...args);
    }

    static room(action, roomId, ...args) {
        console.log(`🏠 [ROOM] ${action}: ${roomId}`, ...args);
    }
}

module.exports = LoggerService;
