const express = require('express');
const roomRoutes = require('./room.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

/**
 * Main API Router
 */

// Room routes
router.use('/rooms', roomRoutes);

// Admin routes (non-API routes)
router.use('/admin', adminRoutes);
module.exports = router;
