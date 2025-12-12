const LoggerService = require('./logger.service');

/**
 * Room Service
 * Manages room operations
 */
class RoomService {
    constructor() {
        this.gameServer = null;
    }

    /**
     * Set game server instance
     */
    setGameServer(gameServer) {
        this.gameServer = gameServer;
        LoggerService.success('RoomService: Game server initialized');
    }

    /**
     * Get all rooms
     */
    async getAllRooms() {
        try {
            if (!this.gameServer) {
                throw new Error('Game server not initialized');
            }

            const rooms = [];
            
            // ✅ Kiểm tra xem rooms có tồn tại không
            if (!this.gameServer.rooms) {
                LoggerService.warning('No rooms available yet');
                return rooms;
            }

            // ✅ Colyseus 0.16+ API
            if (typeof this.gameServer.rooms.forEach === 'function') {
                this.gameServer.rooms.forEach((room) => {
                    rooms.push({
                        roomId: room.roomId,
                        name: room.roomName,
                        clients: room.clients.length,
                        maxClients: room.maxClients,
                        locked: room.locked,
                        available: room.clients.length < room.maxClients && !room.locked,
                        metadata: room.metadata || {}
                    });
                });
            } else if (Array.isArray(this.gameServer.rooms)) {
                // Fallback: nếu rooms là array
                this.gameServer.rooms.forEach((room) => {
                    rooms.push({
                        roomId: room.roomId,
                        name: room.roomName,
                        clients: room.clients.length,
                        maxClients: room.maxClients,
                        locked: room.locked,
                        available: room.clients.length < room.maxClients && !room.locked,
                        metadata: room.metadata || {}
                    });
                });
            }
            
            return rooms;
        } catch (error) {
            LoggerService.error('Failed to get rooms:', error.message);
            throw error;
        }
    }

    /**
     * Get room by ID
     */
    async getRoomById(roomId) {
        try {
            if (!this.gameServer) {
                throw new Error('Game server not initialized');
            }

            if (!this.gameServer.rooms) {
                return null;
            }

            // ✅ Tìm room theo roomId
            let foundRoom = null;

            if (typeof this.gameServer.rooms.get === 'function') {
                foundRoom = this.gameServer.rooms.get(roomId);
            } else if (typeof this.gameServer.rooms.forEach === 'function') {
                this.gameServer.rooms.forEach((room) => {
                    if (room.roomId === roomId) {
                        foundRoom = room;
                    }
                });
            }
            
            if (!foundRoom) {
                return null;
            }
            
            return {
                roomId: foundRoom.roomId,
                name: foundRoom.roomName,
                clients: foundRoom.clients.length,
                maxClients: foundRoom.maxClients,
                locked: foundRoom.locked,
                available: foundRoom.clients.length < foundRoom.maxClients && !foundRoom.locked,
                metadata: foundRoom.metadata || {}
            };
        } catch (error) {
            LoggerService.error('Failed to get room:', error.message);
            throw error;
        }
    }

    /**
     * Get room stats
     */
    async getRoomStats() {
        try {
            if (!this.gameServer) {
                throw new Error('Game server not initialized');
            }

            const rooms = await this.getAllRooms();
            const totalClients = rooms.reduce((sum, room) => sum + room.clients, 0);
            
            return {
                totalRooms: rooms.length,
                totalPlayers: totalClients,
                rooms: rooms
            };
        } catch (error) {
            LoggerService.error('Failed to get room stats:', error.message);
            throw error;
        }
    }

    /**
     * Get available rooms (for joining)
     */
    async getAvailableRooms() {
        try {
            const rooms = await this.getAllRooms();
            return rooms.filter(room => room.available);
        } catch (error) {
            LoggerService.error('Failed to get available rooms:', error.message);
            throw error;
        }
    }

    /**
     * Get total players count
     */
    getTotalPlayers() {
        try {
            if (!this.gameServer || !this.gameServer.rooms) {
                return 0;
            }

            let total = 0;
            
            if (typeof this.gameServer.rooms.forEach === 'function') {
                this.gameServer.rooms.forEach((room) => {
                    total += room.clients.length;
                });
            }
            
            return total;
        } catch (error) {
            LoggerService.error('Failed to get total players:', error.message);
            return 0;
        }
    }

    /**
     * Get total rooms count
     */
    getTotalRooms() {
        try {
            if (!this.gameServer || !this.gameServer.rooms) {
                return 0;
            }

            if (typeof this.gameServer.rooms.size !== 'undefined') {
                return this.gameServer.rooms.size;
            }

            if (Array.isArray(this.gameServer.rooms)) {
                return this.gameServer.rooms.length;
            }

            let count = 0;
            if (typeof this.gameServer.rooms.forEach === 'function') {
                this.gameServer.rooms.forEach(() => count++);
            }

            return count;
        } catch (error) {
            LoggerService.error('Failed to get total rooms:', error.message);
            return 0;
        }
    }
}

module.exports = new RoomService();
