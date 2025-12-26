// src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const LoggerService = require('../services/logger.service');
const path = require('path');
const fs = require('fs');

// Các định dạng file 3D được hỗ trợ
const supportedModelFormats = ['.glb', '.gltf', '.fbx', '.obj', '.stl', '.usdz'];

// Kiểm tra file có phải là model 3D không
const isModel3DFile = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  return supportedModelFormats.includes(ext);
};

// File filter cho multer
const fileFilter = (req, file, cb) => {
  // Kiểm tra nếu là model3dFile thì cho phép các định dạng 3D
  if (file.fieldname === 'model3dFile') {
    if (isModel3DFile(file)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file model 3D (.glb, .gltf, .fbx, .obj, .stl, .usdz)'), false);
    }
  } else {
    // Cho các file khác (hình ảnh, v.v.)
    cb(null, true);
  }
};

// Kiểm tra biến môi trường
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  LoggerService.warning('⚠️ Cloudinary credentials not found in environment variables. Check your .env file (not .env.example).');
  LoggerService.warning('Using local storage as fallback.');
  
  // Sử dụng lưu trữ cục bộ nếu không có thông tin đăng nhập Cloudinary
  const uploadDir = path.join(__dirname, '../../uploads');
  const modelDir = path.join(uploadDir, 'models'); // Thêm thư mục riêng cho model 3D
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    LoggerService.info(`Created uploads directory at ${uploadDir}`);
  }
  
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
    LoggerService.info(`Created models directory at ${modelDir}`);
  }
  
  // Cấu hình multer với disk storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Lưu model 3D vào thư mục riêng
      if (isModel3DFile(file)) {
        cb(null, modelDir);
      } else {
        cb(null, uploadDir);
      }
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024 // Tăng giới hạn lên 50MB cho model 3D
    }
  });
  
  module.exports = {
    upload,
    isLocalStorage: true,
    getLocalImageUrl: (filename) => `/uploads/${filename}`,
    getLocalModelUrl: (filename) => `/uploads/models/${filename}`,
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
    fileFilter: fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024 // Tăng giới hạn lên 50MB cho model 3D
    }
  });

  // Hàm helper để upload trực tiếp lên Cloudinary
  const uploadToCloudinary = async (filePath, options = {}) => {
    try {
      // Xác định resource_type dựa vào loại file
      const ext = path.extname(filePath).toLowerCase();
      const isModel = supportedModelFormats.includes(ext);
      
      // Cấu hình mặc định cho các file khác nhau
      const defaultOptions = isModel 
        ? {
            resource_type: 'raw',  // Sử dụng raw cho file 3D
            folder: 'artgallery/models',
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            access_mode: 'public'
          } 
        : {
            resource_type: 'auto',
            folder: 'artgallery',
          };
      
      // Kết hợp các tùy chọn
      const uploadOptions = {
        ...defaultOptions,
        ...options,
      };
      
      LoggerService.info(`Uploading to Cloudinary: ${filePath} (${isModel ? 'model 3D' : 'regular file'})`);
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

  // Hàm helper để xóa file từ Cloudinary
  const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    if (!publicId) {
      LoggerService.warning('No publicId provided for deletion');
      return { result: 'not_found' };
    }
    
    LoggerService.info(`Attempting to delete from Cloudinary: ${publicId}`);
    
    // Thử các biến thể của publicId khác nhau
    const publicIdVariants = [];
    
    // 1. Giữ nguyên publicId gốc
    publicIdVariants.push(publicId);
    
    // 2. Xử lý publicId, đảm bảo có tiền tố 'artgallery/'
    if (!publicId.startsWith('artgallery/')) {
      publicIdVariants.push(`artgallery/${publicId}`);
    } else {
      // 3. Thử bỏ tiền tố 'artgallery/' nếu có
      publicIdVariants.push(publicId.replace('artgallery/', ''));
    }
    
    // 4. Thử với biến thể models/
    if (publicId.includes('models/')) {
      publicIdVariants.push(publicId.replace('models/', ''));
    } else if (!publicId.includes('models/') && options.isModel) {
      publicIdVariants.push(`models/${publicId}`);
      publicIdVariants.push(`artgallery/models/${publicId}`);
    }
    
    // Lọc các biến thể trùng lặp
    const uniqueVariants = [...new Set(publicIdVariants)];
    LoggerService.info(`Sẽ thử xóa với các ID: ${JSON.stringify(uniqueVariants)}`);
    
    // Thử các resource_type khác nhau
    const resourceTypes = ['raw', 'image', 'video'];
    
    // Biến để theo dõi kết quả
    let deletionSuccess = false;
    let lastResult = null;
    
    // Thử tất cả các kết hợp publicId và resource_type cho đến khi thành công
    for (const variant of uniqueVariants) {
      for (const resourceType of resourceTypes) {
        if (deletionSuccess) continue; // Nếu đã xóa thành công thì dừng lại
        
        try {
          const deleteOptions = {
            ...options,
            resource_type: resourceType,
            invalidate: true
          };
          
          LoggerService.info(`Thử xóa ${variant} với resource_type=${resourceType}`);
          const result = await cloudinary.uploader.destroy(variant, deleteOptions);
          LoggerService.info(`Kết quả xóa ${variant} (${resourceType}): ${JSON.stringify(result)}`);
          
          lastResult = result;
          
          // Kiểm tra nếu xóa thành công
          if (result && result.result === 'ok') {
            deletionSuccess = true;
            LoggerService.success(`Đã xóa thành công file từ Cloudinary: ${variant} (${resourceType})`);
            break;
          }
        } catch (innerError) {
          LoggerService.warning(`Lỗi khi thử xóa ${variant} (${resourceType}): ${innerError.message}`);
        }
      }
    }
    
    if (!deletionSuccess) {
      LoggerService.warning(`Không thể xóa file từ Cloudinary sau khi thử tất cả các biến thể`);
    }
    
    return lastResult || { result: 'not_found' };
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
    deleteFromCloudinary,
    isModel3DFile
  };
}