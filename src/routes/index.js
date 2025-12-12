const express = require('express');
const roomRoutes = require('./room.routes');

const router = express.Router();

/**
 * Main API Router
 */

// Health routes

// Room routes
router.use('/rooms', roomRoutes);

module.exports = router;
