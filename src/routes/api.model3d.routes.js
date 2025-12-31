// src/routes/api.model3d.routes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const Model3DController = require('../controllers/model3d.controller');

// API Routes - không cần middleware auth vì đã nằm trong trang admin
router.get('/model3d', Model3DController.getAllModels);
router.get('/model3d/:id', Model3DController.getModelById);
router.post('/model3d', upload.single('model3dFile'), Model3DController.createModel);
router.put('/model3d/:id', upload.single('model3dFile'), Model3DController.updateModel);
router.delete('/model3d/:id', Model3DController.deleteModel);

module.exports = router;