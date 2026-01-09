/**
 * SanitizerUtil - Input sanitization and validation utility
 * ✅ Comprehensive security and data validation for all user inputs
 * 
 * Features:
 * - Username sanitization
 * - URL validation (Ready Player Me avatars)
 * - Position/coordinate validation
 * - Number bounds checking
 * - Animation state validation
 * - Chat message sanitization
 * - String/text sanitization
 * - Boolean validation
 * - Array/object validation
 */
class SanitizerUtil {
    
    /**
     * ✅ Sanitize player username
     * @param {string} username - Raw username input
     * @returns {string} Sanitized username
     */
    static sanitizeUsername(username) {
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return `Guest_${Math.floor(Math.random() * 9999)}`;
        }
        
        // Remove special characters, keep alphanumeric, underscore, space
        const sanitized = username.trim()
            .replace(/[^a-zA-Z0-9_\s]/g, '')
            .substring(0, 20);
        
        // If after sanitization it's empty, return guest name
        return sanitized.length > 0 ? sanitized : `Guest_${Math.floor(Math.random() * 9999)}`;
    }

    /**
     * ✅ Sanitize and validate avatar URL
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
            
            // ✅ Only allow Ready Player Me URLs and GLB files
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
     * ✅ Validate and sanitize position data
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
     * ✅ Sanitize number with bounds checking
     * @param {any} value - Value to sanitize
     * @param {number} defaultValue - Default if invalid
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number} Sanitized number
     */
    static sanitizeNumber(value, defaultValue = 0, min = -Infinity, max = Infinity) {
        const num = parseFloat(value);
        
        if (isNaN(num) || !isFinite(num)) {
            return defaultValue;
        }
        
        // Clamp between min and max
        return Math.max(min, Math.min(max, num));
    }

    /**
     * ✅ Sanitize animation state
     * @param {string} state - Animation state from client
     * @returns {string} Valid animation state
     */
    static sanitizeAnimationState(state) {
        const validStates = [
            'idle', 
            'walk', 
            'walking',
            'run', 
            'running',
            'jump', 
            'jumping',
            'dance', 
            'dancing',
            'wave', 
            'waving',
            'sit',
            'sitting',
            'clap',
            'clapping'
        ];
        
        if (!state || typeof state !== 'string') {
            return 'idle';
        }
        
        const lowerState = state.toLowerCase().trim();
        return validStates.includes(lowerState) ? lowerState : 'idle';
    }

    /**
     * ✅ Sanitize chat message
     * @param {string} message - Chat message from client
     * @returns {string} Sanitized message
     */
    static sanitizeChatMessage(message) {
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return '';
        }
        
        // Remove HTML tags, control characters, limit length to 500 chars
        return message.trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/[^\w\s\.,!?@#$%&*()\-+=:;'"]/g, '') // Keep safe characters
            .substring(0, 500);
    }

    /**
     * ✅ Sanitize generic string (for emotes, IDs, etc.)
     * @param {string} str - String to sanitize
     * @param {number} maxLength - Maximum length (default: 100)
     * @returns {string} Sanitized string
     */
    static sanitizeString(str, maxLength = 100) {
        if (!str || typeof str !== 'string') {
            return '';
        }
        
        // Remove HTML tags and control characters
        let sanitized = str.trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
        
        // Limit length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        
        return sanitized;
    }

    /**
     * ✅ Sanitize text (for descriptions, etc.)
     * @param {string} text - Text to sanitize
     * @param {number} maxLength - Maximum length (default: 1000)
     * @returns {string} Sanitized text
     */
    static sanitizeText(text, maxLength = 1000) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        
        // Remove HTML tags, control characters
        let sanitized = text.trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
            .replace(/\s+/g, ' '); // Normalize whitespace
        
        // Limit length
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        
        return sanitized;
    }

    /**
     * ✅ Validate boolean
     * @param {any} value - Value to validate
     * @param {boolean} defaultValue - Default if invalid
     * @returns {boolean} Valid boolean
     */
    static sanitizeBoolean(value, defaultValue = false) {
        if (typeof value === 'boolean') {
            return value;
        }
        
        if (typeof value === 'string') {
            const lower = value.toLowerCase().trim();
            return lower === 'true' || lower === '1' || lower === 'yes';
        }
        
        if (typeof value === 'number') {
            return value !== 0;
        }
        
        return defaultValue;
    }

    /**
     * ✅ Sanitize integer
     * @param {any} value - Value to sanitize
     * @param {number} defaultValue - Default if invalid
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number} Sanitized integer
     */
    static sanitizeInteger(value, defaultValue = 0, min = -Infinity, max = Infinity) {
        const num = parseInt(value, 10);
        
        if (isNaN(num) || !isFinite(num)) {
            return defaultValue;
        }
        
        // Clamp between min and max
        return Math.max(min, Math.min(max, num));
    }

    /**
     * ✅ Sanitize email address
     * @param {string} email - Email to sanitize
     * @returns {string} Sanitized email or empty string
     */
    static sanitizeEmail(email) {
        if (!email || typeof email !== 'string') {
            return '';
        }
        
        const sanitized = email.trim().toLowerCase();
        
        // Basic email validation regex
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
        
        if (emailRegex.test(sanitized) && sanitized.length <= 254) {
            return sanitized;
        }
        
        return '';
    }

    /**
     * ✅ Sanitize array of strings
     * @param {array} arr - Array to sanitize
     * @param {number} maxLength - Maximum array length
     * @param {number} maxItemLength - Maximum item length
     * @returns {array} Sanitized array
     */
    static sanitizeStringArray(arr, maxLength = 100, maxItemLength = 100) {
        if (!Array.isArray(arr)) {
            return [];
        }
        
        return arr
            .slice(0, maxLength) // Limit array length
            .map(item => this.sanitizeString(item, maxItemLength))
            .filter(item => item.length > 0); // Remove empty strings
    }

    /**
     * ✅ Sanitize object keys and values
     * @param {object} obj - Object to sanitize
     * @param {array} allowedKeys - Allowed keys
     * @returns {object} Sanitized object
     */
    static sanitizeObject(obj, allowedKeys = []) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
            return {};
        }
        
        const sanitized = {};
        
        for (const key of allowedKeys) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                // Sanitize based on type
                if (typeof value === 'string') {
                    sanitized[key] = this.sanitizeString(value);
                } else if (typeof value === 'number') {
                    sanitized[key] = this.sanitizeNumber(value);
                } else if (typeof value === 'boolean') {
                    sanitized[key] = this.sanitizeBoolean(value);
                } else if (Array.isArray(value)) {
                    sanitized[key] = this.sanitizeStringArray(value);
                }
            }
        }
        
        return sanitized;
    }

    /**
     * ✅ Validate artwork/model ID
     * @param {string} id - ID to validate
     * @returns {string} Sanitized ID or empty string
     */
    static sanitizeId(id) {
        if (!id || typeof id !== 'string') {
            return '';
        }
        
        // Allow alphanumeric, underscore, hyphen
        const sanitized = id.trim().replace(/[^a-zA-Z0-9_-]/g, '');
        
        if (sanitized.length > 0 && sanitized.length <= 100) {
            return sanitized;
        }
        
        return '';
    }

    /**
     * ✅ Sanitize speed value
     * @param {number} speed - Speed value
     * @returns {number} Sanitized speed (0-10)
     */
    static sanitizeSpeed(speed) {
        return this.sanitizeNumber(speed, 0, 0, 10);
    }

    /**
     * ✅ Sanitize rotation (0-360 degrees)
     * @param {number} rotation - Rotation value
     * @returns {number} Sanitized rotation
     */
    static sanitizeRotation(rotation) {
        let rot = this.sanitizeNumber(rotation, 0, -Infinity, Infinity);
        
        // Normalize to 0-360
        while (rot < 0) rot += 360;
        while (rot >= 360) rot -= 360;
        
        return rot;
    }

    /**
     * ✅ Sanitize timestamp
     * @param {number} timestamp - Timestamp to validate
     * @returns {number} Valid timestamp or current time
     */
    static sanitizeTimestamp(timestamp) {
        const ts = this.sanitizeInteger(timestamp, Date.now());
        
        // Check if timestamp is reasonable (not in far future/past)
        const now = Date.now();
        const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
        const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000);
        
        if (ts < oneYearAgo || ts > oneYearFromNow) {
            return now;
        }
        
        return ts;
    }

    /**
     * ✅ Validate and sanitize color hex code
     * @param {string} color - Color hex code
     * @returns {string} Valid hex color or default
     */
    static sanitizeColor(color, defaultColor = '#FFFFFF') {
        if (!color || typeof color !== 'string') {
            return defaultColor;
        }
        
        // Remove # if present
        let hex = color.trim().replace('#', '');
        
        // Validate hex format (3 or 6 characters)
        if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
            // Convert 3-char to 6-char
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
            return '#' + hex.toUpperCase();
        }
        
        return defaultColor;
    }

    /**
     * ✅ Sanitize file name
     * @param {string} fileName - File name to sanitize
     * @returns {string} Sanitized file name
     */
    static sanitizeFileName(fileName) {
        if (!fileName || typeof fileName !== 'string') {
            return 'unnamed_file';
        }
        
        // Remove path separators and dangerous characters
        const sanitized = fileName.trim()
            .replace(/[\/\\]/g, '') // Remove path separators
            .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
            .substring(0, 255); // Limit length
        
        return sanitized.length > 0 ? sanitized : 'unnamed_file';
    }

    /**
     * ✅ Validate JSON string
     * @param {string} jsonString - JSON string to validate
     * @returns {object|null} Parsed object or null
     */
    static sanitizeJSON(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') {
            return null;
        }
        
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('⚠️ Invalid JSON string:', error.message);
            return null;
        }
    }

    /**
     * ✅ Rate limiting check (simple in-memory)
     * @param {string} key - Unique key (e.g., sessionId)
     * @param {number} maxRequests - Max requests per window
     * @param {number} windowMs - Time window in milliseconds
     * @returns {boolean} True if allowed, false if rate limited
     */
    static checkRateLimit(key, maxRequests = 10, windowMs = 1000) {
        if (!this._rateLimitStore) {
            this._rateLimitStore = new Map();
        }
        
        const now = Date.now();
        const record = this._rateLimitStore.get(key);
        
        if (!record) {
            this._rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }
        
        if (now > record.resetTime) {
            // Reset window
            this._rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
            return true;
        }
        
        if (record.count >= maxRequests) {
            return false; // Rate limited
        }
        
        record.count++;
        return true;
    }

    /**
     * ✅ Clear rate limit store (call periodically to prevent memory leak)
     */
    static clearRateLimitStore() {
        if (this._rateLimitStore) {
            const now = Date.now();
            for (const [key, record] of this._rateLimitStore.entries()) {
                if (now > record.resetTime) {
                    this._rateLimitStore.delete(key);
                }
            }
        }
    }
}

module.exports = SanitizerUtil;
