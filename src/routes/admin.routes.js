const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const AdminController = require('../controllers/admin.controller');
const ImageController = require('../controllers/image.controller'); // Thêm import ImageController
const imageRoutes = require('./image.routes');

// Public routes
router.get('/login', AdminController.renderLogin);
router.post('/login', AdminController.login);
router.get('/logout', AdminController.logout);

// Protected routes (cần xác thực)
router.get('/', authMiddleware, AdminController.renderDashboard);

// Unity Admin route
router.get('/unity', authMiddleware, AdminController.renderUnityAdmin);

// Image routes - quản lý ảnh trong admin
router.use('/images', imageRoutes);

// API route cho client lấy ảnh - sửa lại sử dụng controller thay vì router
router.get('/getimage/:frame', ImageController.getImageByFrame);

module.exports = router;