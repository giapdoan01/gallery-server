// src/services/model3d.service.js
const Model3DModel = require('../model/Model3D.model');
const LoggerService = require('./logger.service');
const { isLocalStorage, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

class Model3DService {
  /**
   * Tạo model 3D mới
   */
  async createModel(modelData, userId) {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!modelData.name) {
        throw new Error('Tên model là bắt buộc');
      }

      const newModel = await Model3DModel.create({
        ...modelData,
        createdBy: userId
      });

      LoggerService.success(`Model 3D đã được tạo: ${newModel.name}`);
      return newModel;
    } catch (error) {
      LoggerService.error(`Lỗi tạo model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
 * Xóa model 3D
 */
  async deleteModel(id) {
    try {
      const model = await Model3DModel.findByPk(id);
      if (!model) {
        throw new Error(`Không tìm thấy model 3D với ID ${id}`);
      }

      // Kiểm tra và ghi log thông tin model để debug
      LoggerService.info(`Đang xóa model: ${JSON.stringify(model)}`);
      
      // Lấy đúng tên trường chứa publicId (có thể là publicId hoặc public_id)
      const publicIdField = model.publicId || model.public_id;

      // Nếu model có publicId, xóa nó khỏi Cloudinary
      if (publicIdField && !isLocalStorage) {
        try {
          // Đảm bảo xóa với resource_type đúng cho model 3D
          await deleteFromCloudinary(publicIdField, { resource_type: 'raw', isModel: true });
          LoggerService.success(`Đã xóa file model 3D từ Cloudinary: ${publicIdField}`);
        } catch (cloudinaryError) {
          LoggerService.warning(`Không thể xóa file model 3D từ Cloudinary: ${cloudinaryError.message}`);
        }
      } else {
        LoggerService.warning(`Model không có publicId hoặc đang sử dụng local storage`);
      }

      const result = await Model3DModel.destroy(id);
      return result;
    } catch (error) {
      LoggerService.error(`Lỗi xóa model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy tất cả model 3D
   */
  async getAllModels() {
    try {
      const models = await Model3DModel.findAll();
      return models;
    } catch (error) {
      LoggerService.error(`Lỗi lấy danh sách model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy model 3D theo ID
   */
  async getModelById(id) {
    try {
      const model = await Model3DModel.findByPk(id);
      if (!model) {
        throw new Error(`Không tìm thấy model 3D với ID ${id}`);
      }
      return model;
    } catch (error) {
      LoggerService.error(`Lỗi lấy thông tin model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật model 3D
   */
  async updateModel(id, modelData, userId) {
    try {
      const existingModel = await Model3DModel.findByPk(id);
      if (!existingModel) {
        throw new Error(`Không tìm thấy model 3D với ID ${id}`);
      }

      const updatedModel = await Model3DModel.update(id, {
        ...modelData,
        updatedBy: userId
      });

      LoggerService.success(`Model 3D đã được cập nhật: ${updatedModel.name}`);
      return updatedModel;
    } catch (error) {
      LoggerService.error(`Lỗi cập nhật model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload model 3D lên Cloudinary
   */
  async uploadModel(file) {
    try {
      if (isLocalStorage) {
        // Xử lý upload local
        return {
          url: `/uploads/${path.basename(file.path)}`,
          publicId: null
        };
      } else {
        // Upload lên Cloudinary
        if (!file) {
          throw new Error('Không tìm thấy file để upload');
        }
        
        const result = await uploadToCloudinary(file.path, {
          resource_type: 'auto',  // Cho phép upload nhiều loại file
          folder: 'artgallery/models' // Lưu trong thư mục riêng
        });
        
        return {
          url: result.secure_url,
          publicId: result.public_id
        };
      }
    } catch (error) {
      LoggerService.error(`Lỗi upload model 3D: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new Model3DService();