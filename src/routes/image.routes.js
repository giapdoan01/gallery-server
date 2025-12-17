// src/routes/image.routes.js
const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/image.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

// API routes - không cần xác thực
router.get('/getimage/:frame', ImageController.getImageByFrame);

// Admin routes - cần xác thực
router.get('/', authMiddleware, ImageController.renderImageList);
router.get('/create', authMiddleware, ImageController.renderCreateImage);
router.post('/create', authMiddleware, upload.single('image'), ImageController.createImage);
router.get('/edit/:id', authMiddleware, ImageController.renderEditImage);
router.post('/edit/:id', authMiddleware, upload.single('image'), ImageController.updateImage);
router.get('/delete/:id', authMiddleware, ImageController.deleteImage);

module.exports = router;