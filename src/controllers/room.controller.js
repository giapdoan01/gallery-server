const ResponseUtil = require('../utils/response.util');
const RoomService = require('../services/room.service');
const LoggerService = require('../services/logger.service');

/**
 * Room Controller
 */
class RoomController {

    static async getAllRooms(req, res) {
        try {
            const rooms = await RoomService.getAllRooms();
            
            return ResponseUtil.success(res, {
                total: rooms.length,
                rooms: rooms
            }, 'Rooms retrieved successfully');
        } catch (error) {
            LoggerService.error('Get all rooms failed:', error.message);
            return ResponseUtil.error(res, error.message || 'Failed to get rooms');
        }
    }

    /**
     * Get available rooms (for joining)
     */
    static async getAvailableRooms(req, res) {
        try {
            const rooms = await RoomService.getAvailableRooms();
            
            return ResponseUtil.success(res, {
                total: rooms.length,
                rooms: rooms
            }, 'Available rooms retrieved successfully');
        } catch (error) {
            LoggerService.error('Get available rooms failed:', error.message);
            return ResponseUtil.error(res, error.message || 'Failed to get available rooms');
        }
    }

    /**
     * Get room by ID
     */
    static async getRoomById(req, res) {
        try {
            const { roomId } = req.params;
            const room = await RoomService.getRoomById(roomId);
            
            if (!room) {
                return ResponseUtil.notFound(res, 'Room not found');
            }
            
            return ResponseUtil.success(res, { room }, 'Room retrieved successfully');
        } catch (error) {
            LoggerService.error('Get room by ID failed:', error.message);
            return ResponseUtil.error(res, error.message || 'Failed to get room');
        }
    }

    /**
     * Get room stats
     */
    static async getStats(req, res) {
        try {
            const stats = await RoomService.getRoomStats();
            
            return ResponseUtil.success(res, stats, 'Stats retrieved successfully');
        } catch (error) {
            LoggerService.error('Get stats failed:', error.message);
            return ResponseUtil.error(res, error.message || 'Failed to get stats');
        }
    }
}

module.exports = RoomController;
