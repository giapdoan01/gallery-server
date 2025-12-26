// src/routes/api.model3d.routes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/auth.middleware');
const Model3DController = require('../controllers/model3d.controller');

// API Routes
router.get('/model3d', Model3DController.getAllModels);
router.get('/model3d/:id', Model3DController.getModelById);
router.post('/model3d', authMiddleware, upload.single('model3dFile'), Model3DController.createModel);
router.put('/model3d/:id', authMiddleware, upload.single('model3dFile'), Model3DController.updateModel);
router.delete('/model3d/:id', authMiddleware, Model3DController.deleteModel);

module.exports = router;