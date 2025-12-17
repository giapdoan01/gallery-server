// src/services/image.service.js
const Image = require('../model/Image.model');
const LoggerService = require('./logger.service');

class ImageService {
  /**
   * Lấy tất cả ảnh
   */
  static async getAllImages() {
    try {
      return await Image.findAll({
        order: [['frameUse', 'ASC']]
      });
    } catch (error) {
      LoggerService.error('Failed to get images:', error.message);
      throw error;
    }
  }

  /**
   * Lấy ảnh theo ID
   */
  static async getImageById(id) {
    try {
      return await Image.findByPk(id);
    } catch (error) {
      LoggerService.error(`Failed to get image by ID ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Lấy ảnh theo frameUse
   */
  static async getImageByFrame(frameUse) {
    try {
      return await Image.findOne({
        where: { frameUse }
      });
    } catch (error) {
      LoggerService.error(`Failed to get image by frame ${frameUse}:`, error.message);
      throw error;
    }
  }

  /**
   * Tạo ảnh mới
   */
  static async createImage(imageData, userId) {
    try {
      // Kiểm tra frameUse có bị trùng không
      const existingFrame = await Image.findOne({
        where: { frameUse: imageData.frameUse }
      });

      if (existingFrame) {
        throw new Error(`Frame ${imageData.frameUse} đã được sử dụng`);
      }

      const newImage = await Image.create({
        ...imageData,
        createdBy: userId,
        lastUpdatedBy: userId
      });

      LoggerService.success(`New image created for frame ${imageData.frameUse}`);
      return newImage;
    } catch (error) {
      LoggerService.error('Failed to create image:', error.message);
      throw error;
    }
  }

  /**
   * Cập nhật ảnh
   */
  static async updateImage(id, imageData, userId) {
    try {
      const image = await Image.findByPk(id);
      
      if (!image) {
        throw new Error(`Không tìm thấy ảnh với ID ${id}`);
      }

      // Kiểm tra frameUse có bị trùng không nếu frameUse thay đổi
      if (imageData.frameUse !== image.frameUse) {
        const existingFrame = await Image.findOne({
          where: { frameUse: imageData.frameUse }
        });

        if (existingFrame && existingFrame.id !== parseInt(id)) {
          throw new Error(`Frame ${imageData.frameUse} đã được sử dụng`);
        }
      }

      // Cập nhật thông tin ảnh
      await image.update({
        ...imageData,
        lastUpdatedBy: userId
      });

      LoggerService.success(`Image ID ${id} updated successfully`);
      return image;
    } catch (error) {
      LoggerService.error(`Failed to update image ID ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Xóa ảnh
   */
  static async deleteImage(id) {
    try {
      const image = await Image.findByPk(id);
      
      if (!image) {
        throw new Error(`Không tìm thấy ảnh với ID ${id}`);
      }

      // Log thông tin ảnh để debug
      LoggerService.debug('Image data to delete:', {
        id: image.id,
        name: image.name,
        publicId: image.publicId,
        url: image.url
      });

      // Xử lý xóa ảnh từ Cloudinary
      if (image.publicId) {
        try {
          const cloudinaryConfig = require('../config/cloudinary');
          
          // Sử dụng hàm helper để xóa ảnh
          if (cloudinaryConfig.deleteFromCloudinary) {
            await cloudinaryConfig.deleteFromCloudinary(image.publicId);
          } else {
            // Fallback nếu không có hàm helper
            const { cloudinary } = cloudinaryConfig;
            await cloudinary.uploader.destroy(image.publicId);
          }
          
          LoggerService.success(`Deleted image ${image.publicId} from Cloudinary`);
        } catch (cloudinaryError) {
          LoggerService.error(`Failed to delete from Cloudinary: ${cloudinaryError.message}`);
        }
      } else if (image.url && image.url.startsWith('/uploads/')) {
        // Xử lý xóa file cục bộ
        try {
          const fs = require('fs');
          const path = require('path');
          const filePath = path.join(__dirname, '../..', image.url);
          LoggerService.info(`Attempting to delete local file: ${filePath}`);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            LoggerService.success(`Deleted local file: ${filePath}`);
          }
        } catch (fsError) {
          LoggerService.error(`Failed to delete local file: ${fsError.message}`);
        }
      }

      // Xóa bản ghi trong database
      await image.destroy();
      LoggerService.success(`Image record ID ${id} deleted successfully from database`);
      return true;
    } catch (error) {
      LoggerService.error(`Failed to delete image ID ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Upload ảnh lên Cloudinary
   */
  static async uploadImage(file) {
    try {
      const cloudinaryConfig = require('../config/cloudinary');
      
      if (cloudinaryConfig.isLocalStorage) {
        // Xử lý cho local storage
        return {
          url: cloudinaryConfig.getLocalImageUrl(file.filename),
          publicId: file.filename
        };
      } else {
        // Xử lý cho Cloudinary - sử dụng hàm helper trực tiếp
        if (cloudinaryConfig.uploadToCloudinary) {
          // Tạo một publicId duy nhất không trùng lặp
          const timestamp = Date.now();
          const uniqueId = Math.random().toString(36).substring(2, 10);
          const fileName = `img_${timestamp}_${uniqueId}`;
          
          // Upload file lên Cloudinary với publicId xác định
          const result = await cloudinaryConfig.uploadToCloudinary(file.path, {
            public_id: fileName,  // Chỉ định publicId rõ ràng
            overwrite: true       // Ghi đè nếu đã tồn tại
          });
          
          LoggerService.debug('Cloudinary upload result:', {
            public_id: result.public_id,
            secure_url: result.secure_url
          });
          
          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        } else {
          // Fallback nếu không có hàm helper
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'artgallery'
          });
          
          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        }
      }
    } catch (error) {
      LoggerService.error('Failed to upload image:', error.message);
      throw error;
    }
  }

  /**
   * Hàm hỗ trợ debug để liệt kê tất cả ảnh và publicId
   */
  static async debugImageRecords() {
    try {
      const images = await Image.findAll({
        attributes: ['id', 'name', 'url', 'publicId', 'frameUse']
      });
      
      LoggerService.info(`Found ${images.length} images in database`);
      
      for (const img of images) {
        LoggerService.debug(`Image [${img.id}]: name=${img.name}, frame=${img.frameUse}, publicId=${img.publicId}`);
      }
      
      return images;
    } catch (error) {
      LoggerService.error('Failed to debug image records:', error.message);
      return [];
    }
  }

  /**
   * Hàm cập nhật lại publicId đúng từ URL
   */
  static async fixPublicIds() {
    try {
      const images = await Image.findAll({
        where: {
          url: {
            [Op.like]: '%cloudinary.com%'
          }
        }
      });
      
      LoggerService.info(`Found ${images.length} Cloudinary images to fix`);
      
      for (const image of images) {
        try {
          // Phân tích URL để lấy publicId chính xác
          const url = image.url;
          const urlParts = url.split('/');
          const v1Index = url.indexOf('/v1/');
          
          if (v1Index > -1) {
            const afterV1 = url.substring(v1Index + 4);
            const parts = afterV1.split('/');
            
            if (parts.length >= 2) {
              const folder = parts[0];
              const fileWithExt = parts[parts.length - 1];
              const file = fileWithExt.split('.')[0];
              const fullId = `${folder}/${file}`;
              
              if (fullId !== image.publicId) {
                LoggerService.info(`Fixing image ${image.id}: Old publicId=${image.publicId}, New publicId=${fullId}`);
                await image.update({ publicId: fullId });
              }
            }
          }
        } catch (updateError) {
          LoggerService.error(`Failed to fix publicId for image ${image.id}:`, updateError.message);
        }
      }
      
      return { fixed: images.length };
    } catch (error) {
      LoggerService.error('Failed to fix publicIds:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = ImageService;