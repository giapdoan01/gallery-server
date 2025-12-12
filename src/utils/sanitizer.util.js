/**
 * Sanitizer Utility
 * Input sanitization
 */
class SanitizerUtil {
    /**
     * Sanitize player name
     */
    static sanitizeName(name) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return `Guest_${Math.floor(Math.random() * 9999)}`;
        }
        
        // Remove special characters, limit length
        return name.trim()
            .replace(/[^a-zA-Z0-9_\s]/g, '')
            .substring(0, 20);
    }

    /**
     * Sanitize URL
     */
    static sanitizeUrl(url) {
        if (!url || typeof url !== 'string') {
            return '';
        }
        
        // Basic URL validation
        try {
            new URL(url);
            return url.trim();
        } catch {
            return '';
        }
    }

    /**
     * Validate position data
     */
    static validatePosition(data) {
        return {
            x: this.sanitizeNumber(data.x, 0),
            y: this.sanitizeNumber(data.y, 0),
            z: this.sanitizeNumber(data.z, 0),
            rotY: this.sanitizeNumber(data.rotY, 0),
            speed: this.sanitizeNumber(data.speed, 0)
        };
    }

    /**
     * Sanitize number
     */
    static sanitizeNumber(value, defaultValue = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }
}

module.exports = SanitizerUtil;
