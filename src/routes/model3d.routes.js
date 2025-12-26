// src/routes/model3d.routes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/auth.middleware');
const Model3DController = require('../controllers/model3d.controller');

// Admin routes - Quản lý model 3D
router.get('/', authMiddleware, Model3DController.renderModelList);
router.get('/create', authMiddleware, Model3DController.renderCreateModel);
router.get('/edit/:id', authMiddleware, Model3DController.renderEditModel);

// API routes cho quản lý trong admin panel
router.post('/', authMiddleware, upload.single('model3dFile'), Model3DController.createModel);
router.put('/:id', authMiddleware, upload.single('model3dFile'), Model3DController.updateModel);
router.delete('/:id', authMiddleware, Model3DController.deleteModel);
router.get('/api', Model3DController.getAllModels);
router.get('/api/:id', Model3DController.getModelById);

module.exports = router;