/**
 * Sanitizer Utility
 * Input sanitization and validation
 */
class SanitizerUtil {
    /**
     * Sanitize player username
     * @param {string} username - Raw username input
     * @returns {string} Sanitized username
     */
    static sanitizeUsername(username) {
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return `Guest_${Math.floor(Math.random() * 9999)}`;
        }
        
        // Remove special characters, limit length to 20 chars
        const sanitized = username.trim()
            .replace(/[^a-zA-Z0-9_\s]/g, '')
            .substring(0, 20);
        
        // If after sanitization it's empty, return guest name
        return sanitized.length > 0 ? sanitized : `Guest_${Math.floor(Math.random() * 9999)}`;
    }

    /**
     * Sanitize and validate avatar URL
     * @param {string} url - Avatar URL from client
     * @returns {string} Validated URL or default avatar
     */
    static sanitizeUrl(url) {
        // Default Ready Player Me avatar
        const defaultAvatar = 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb';
        
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return defaultAvatar;
        }
        
        try {
            const urlObj = new URL(url.trim());
            
            // ✅ Only allow Ready Player Me URLs
            if (urlObj.hostname === 'models.readyplayer.me' && urlObj.pathname.endsWith('.glb')) {
                return url.trim();
            }
            
            console.warn(`⚠️ Invalid avatar URL domain: ${urlObj.hostname}`);
            return defaultAvatar;
            
        } catch (error) {
            console.warn(`⚠️ Invalid avatar URL format: ${url}`);
            return defaultAvatar;
        }
    }

    /**
     * Validate and sanitize position data
     * @param {object} data - Position data from client
     * @returns {object} Sanitized position data
     */
    static validatePosition(data) {
        if (!data || typeof data !== 'object') {
            return {
                x: 0,
                y: 0,
                z: 0,
                rotationY: 0
            };
        }

        return {
            x: this.sanitizeNumber(data.x, 0, -1000, 1000),
            y: this.sanitizeNumber(data.y, 0, -100, 100),
            z: this.sanitizeNumber(data.z, 0, -1000, 1000),
            rotationY: this.sanitizeNumber(data.rotationY || data.rotY, 0, -360, 360)
        };
    }

    /**
     * Sanitize number with bounds checking
     * @param {any} value - Value to sanitize
     * @param {number} defaultValue - Default if invalid
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number} Sanitized number
     */
    static sanitizeNumber(value, defaultValue = 0, min = -Infinity, max = Infinity) {
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return defaultValue;
        }
        
        // Clamp between min and max
        return Math.max(min, Math.min(max, num));
    }

    /**
     * Sanitize animation state
     * @param {string} state - Animation state from client
     * @returns {string} Valid animation state
     */
    static sanitizeAnimationState(state) {
        const validStates = ['idle', 'walk', 'run', 'jump', 'dance', 'wave'];
        
        if (!state || typeof state !== 'string') {
            return 'idle';
        }
        
        const lowerState = state.toLowerCase().trim();
        return validStates.includes(lowerState) ? lowerState : 'idle';
    }

    /**
     * Sanitize chat message
     * @param {string} message - Chat message from client
     * @returns {string} Sanitized message
     */
    static sanitizeChatMessage(message) {
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return '';
        }
        
        // Remove HTML tags, limit length to 200 chars
        return message.trim()
            .replace(/<[^>]*>/g, '')
            .replace(/[^\w\s\.,!?@#$%&*()\-+=]/g, '')
            .substring(0, 200);
    }

    /**
     * Validate boolean
     * @param {any} value - Value to validate
     * @param {boolean} defaultValue - Default if invalid
     * @returns {boolean} Valid boolean
     */
    static sanitizeBoolean(value, defaultValue = false) {
        if (typeof value === 'boolean') {
            return value;
        }
        
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        
        return defaultValue;
    }
}

module.exports = SanitizerUtil;
