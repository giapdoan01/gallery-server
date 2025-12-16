class SanitizerUtil {
    static sanitizeUsername(username) {
        if (!username || typeof username !== 'string') {
            return 'Guest';
        }
        
        // Remove special characters, max 20 chars
        return username
            .replace(/[^a-zA-Z0-9_\s]/g, '')
            .substring(0, 20)
            .trim() || 'Guest';
    }

    static sanitizeUrl(url) {
        if (!url || typeof url !== 'string') {
            return 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb';
        }

        // Validate URL format
        try {
            const urlObj = new URL(url);
            
            // Only allow Ready Player Me URLs
            if (urlObj.hostname === 'models.readyplayer.me') {
                return url;
            }
        } catch (e) {
            console.warn('Invalid avatar URL:', url);
        }

        // Return default if invalid
        return 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb';
    }
}

module.exports = SanitizerUtil;
