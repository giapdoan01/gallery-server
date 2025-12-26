const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const AdminController = require('../controllers/admin.controller');
const ImageController = require('../controllers/image.controller');
const imageRoutes = require('./image.routes');
const model3dRoutes = require('./model3d.routes'); // Thêm import model3dRoutes

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

// Model3D routes - quản lý model 3D trong admin
router.use('/model3d', model3dRoutes); // Thêm route cho model3d

// API route cho client lấy ảnh
router.get('/getimage/:frame', ImageController.getImageByFrame);

module.exports = router;