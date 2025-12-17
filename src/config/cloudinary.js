// src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const LoggerService = require('../services/logger.service');
const path = require('path');
const fs = require('fs');

// Kiểm tra biến môi trường
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  LoggerService.warning('⚠️ Cloudinary credentials not found in environment variables. Check your .env file (not .env.example).');
  LoggerService.warning('Using local storage as fallback.');
  
  // Sử dụng lưu trữ cục bộ nếu không có thông tin đăng nhập Cloudinary
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    LoggerService.info(`Created uploads directory at ${uploadDir}`);
  }
  
  // Cấu hình multer với disk storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ storage: storage });
  
  module.exports = {
    upload,
    isLocalStorage: true,
    getLocalImageUrl: (filename) => `/uploads/${filename}`,
    uploadToCloudinary: null,
    deleteFromCloudinary: null
  };
} else {
  // Cấu hình Cloudinary với biến môi trường
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    LoggerService.success(`✅ Cloudinary configured with account: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  } catch (error) {
    LoggerService.error(`Failed to configure Cloudinary: ${error.message}`);
  }

  // Sử dụng multer với disk storage tạm thời
  const tempDir = path.join(__dirname, '../../temp-uploads');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tempDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
    }
  });

  // Hàm helper để upload trực tiếp lên Cloudinary
  const uploadToCloudinary = async (filePath, options = {}) => {
    try {
      // Đảm bảo luôn upload vào folder artgallery
      const uploadOptions = {
        folder: 'artgallery',
        ...options,
      };
      
      LoggerService.info(`Uploading to Cloudinary: ${filePath}`);
      const result = await cloudinary.uploader.upload(filePath, uploadOptions);
      LoggerService.success(`Uploaded to Cloudinary: ${result.public_id}`);
      
      // Xóa file tạm sau khi upload
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        LoggerService.warning(`Could not delete temp file: ${filePath}`);
      }
      
      return result;
    } catch (error) {
      LoggerService.error(`Error uploading to Cloudinary: ${error.message}`);
      throw error;
    }
  };

  // Hàm helper để xóa ảnh từ Cloudinary
  const deleteFromCloudinary = async (publicId) => {
    try {
      if (!publicId) {
        LoggerService.warning('No publicId provided for deletion');
        return { result: 'not_found' };
      }
      
      LoggerService.info(`Deleting from Cloudinary: ${publicId}`);
      
      // Xử lý publicId, đảm bảo có tiền tố 'artgallery/'
      let fullPublicId = publicId;
      if (!publicId.startsWith('artgallery/')) {
        fullPublicId = `artgallery/${publicId}`;
      }
      
      const result = await cloudinary.uploader.destroy(fullPublicId);
      LoggerService.info(`Deletion result for ${fullPublicId}: ${JSON.stringify(result)}`);
      
      return result;
    } catch (error) {
      LoggerService.error(`Error deleting from Cloudinary: ${error.message}`);
      throw error;
    }
  };

  module.exports = {
    cloudinary,
    upload,
    isLocalStorage: false,
    uploadToCloudinary,
    deleteFromCloudinary
  };
}