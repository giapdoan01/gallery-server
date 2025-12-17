const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const AdminController = require('../controllers/admin.controller');
const imageRoutes = require('./image.routes');

// Public routes
router.get('/login', AdminController.renderLogin);
router.post('/login', AdminController.login);
router.get('/logout', AdminController.logout);

// Protected routes (cần xác thực)
router.get('/', authMiddleware, AdminController.renderDashboard);

// Image routes
router.use('/images', imageRoutes);

// API route cho client lấy ảnh
router.get('/getimage/:frame', imageRoutes);

module.exports = router;