/**
 * Player Model
 * Represents player data structure
 */
class PlayerModel {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || 'Guest';
        this.avatarUrl = data.avatarUrl || '';
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.z = data.z || 0;
        this.rotY = data.rotY || 0;
        this.animationState = data.animationState || 'idle';
        this.speed = data.speed || 0;
        this.joinedAt = data.joinedAt || Date.now();
    }

    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            avatarUrl: this.avatarUrl,
            position: {
                x: this.x,
                y: this.y,
                z: this.z
            },
            rotation: {
                y: this.rotY
            },
            animationState: this.animationState,
            speed: this.speed,
            joinedAt: this.joinedAt
        };
    }

    /**
     * Update position
     */
    updatePosition(x, y, z, rotY, speed) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotY = rotY;
        this.speed = speed;
    }

    /**
     * Update animation
     */
    updateAnimation(state) {
        this.animationState = state;
    }
}

module.exports = PlayerModel;
