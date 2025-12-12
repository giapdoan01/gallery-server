const express = require('express');
const RoomController = require('../controllers/room.controller');

const router = express.Router();

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms
 */
router.get('/', RoomController.getAllRooms);

/**
 * @route   GET /api/rooms/available
 * @desc    Get available rooms for joining
 */
router.get('/available', RoomController.getAvailableRooms);

/**
 * @route   GET /api/rooms/stats
 * @desc    Get room stats
 */
router.get('/stats', RoomController.getStats);

/**
 * @route   GET /api/rooms/:roomId
 * @desc    Get room by ID
 */
router.get('/:roomId', RoomController.getRoomById);

module.exports = router;
