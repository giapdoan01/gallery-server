// src/routes/api.image.routes.js
const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/image.controller');
const ImageService = require('../services/image.service');
const LoggerService = require('../services/logger.service');
const { upload } = require('../config/cloudinary');

// API routes không cần xác thực - có thể gọi từ client
router.get('/getimage/:frame', ImageController.getImageByFrame);

// Lấy tất cả ảnh
router.get('/images', async (req, res) => {
  try {
    const images = await ImageService.getAllImages();
    return res.status(200).json({
      success: true,
      data: images
    });
  } catch (error) {
    LoggerService.error(`API error - getAllImages:`, error.message);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message}`
    });
  }
});

// Lấy ảnh theo ID
router.get('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const image = await ImageService.getImageById(id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy ảnh với ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: image
    });
  } catch (error) {
    LoggerService.error(`API error - getImage ${req.params.id}:`, error.message);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message}`
    });
  }
});

// Tạo ảnh mới
router.post('/images', upload.single('image'), async (req, res) => {
  try {
    const { name, frameUse } = req.body;

    let imageData = {
      name,
      frameUse: parseInt(frameUse),
      url: '',
      publicId: ''
    };

    if (req.file) {
      const result = await ImageService.uploadImage(req.file);
      imageData.url = result.url;
      imageData.publicId = result.publicId;
    }

    // Không yêu cầu userId cho API client
    const newImage = await ImageService.createImage(imageData, null);
    
    return res.status(201).json({
      success: true,
      data: newImage,
      message: 'Tạo ảnh thành công'
    });
  } catch (error) {
    LoggerService.error(`API error - createImage:`, error.message);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message}`
    });
  }
});

// Cập nhật ảnh theo ID
router.put('/images/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, frameUse } = req.body;

    const image = await ImageService.getImageById(id);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy ảnh với ID ${id}`
      });
    }

    let imageData = {
      name,
      frameUse: parseInt(frameUse),
      url: image.url,
      publicId: image.publicId
    };

    if (req.file) {
      if (image.publicId) {
        const { cloudinary } = require('../config/cloudinary');
        await cloudinary.uploader.destroy(image.publicId);
      }

      const result = await ImageService.uploadImage(req.file);
      imageData.url = result.url;
      imageData.publicId = result.publicId;
    }

    // Không yêu cầu userId cho API client
    const updatedImage = await ImageService.updateImage(id, imageData, null);
    
    return res.status(200).json({
      success: true,
      data: updatedImage,
      message: 'Cập nhật ảnh thành công'
    });
  } catch (error) {
    LoggerService.error(`API error - updateImage ${req.params.id}:`, error.message);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message}`
    });
  }
});

// THÊM: Cập nhật ảnh theo frame
router.put('/images/frame/:frame', upload.single('image'), async (req, res) => {
  try {
    const { frame } = req.params;
    const frameId = parseInt(frame);
    const { name } = req.body;

    // Tìm ảnh theo frame
    const image = await ImageService.getImageByFrame(frameId);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy ảnh với frame ${frameId}`
      });
    }

    let imageData = {
      name,
      frameUse: frameId, // Giữ nguyên frame
      url: image.url,
      publicId: image.publicId
    };

    if (req.file) {
      if (image.publicId) {
        const { cloudinary } = require('../config/cloudinary');
        await cloudinary.uploader.destroy(image.publicId);
      }

      const result = await ImageService.uploadImage(req.file);
      imageData.url = result.url;
      imageData.publicId = result.publicId;
    }

    // Cập nhật ảnh theo id của ảnh tìm được
    const updatedImage = await ImageService.updateImage(image.id, imageData, null);
    
    return res.status(200).json({
      success: true,
      data: updatedImage,
      message: `Cập nhật ảnh cho frame ${frameId} thành công`
    });
  } catch (error) {
    LoggerService.error(`API error - updateImageByFrame ${req.params.frame}:`, error.message);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message}`
    });
  }
});

// Xóa ảnh theo ID
router.delete('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await ImageService.deleteImage(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy ảnh với ID ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa ảnh thành công'
    });
  } catch (error) {
    LoggerService.error(`API error - deleteImage ${req.params.id}:`, error.message);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message}`
    });
  }
});

// THÊM: Xóa ảnh theo frame
router.delete('/images/frame/:frame', async (req, res) => {
  try {
    const { frame } = req.params;
    const frameId = parseInt(frame);
    
    // Tìm ảnh theo frame
    const image = await ImageService.getImageByFrame(frameId);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy ảnh với frame ${frameId}`
      });
    }
    
    // Xóa ảnh theo id của ảnh tìm được
    const result = await ImageService.deleteImage(image.id);
    
    return res.status(200).json({
      success: true,
      message: `Xóa ảnh cho frame ${frameId} thành công`
    });
  } catch (error) {
    LoggerService.error(`API error - deleteImageByFrame ${req.params.frame}:`, error.message);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message}`
    });
  }
});

module.exports = router;