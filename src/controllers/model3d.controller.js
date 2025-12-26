// src/controllers/model3d.controller.js
const Model3DService = require('../services/model3d.service');
const LoggerService = require('../services/logger.service');
const { upload } = require('../config/cloudinary');

class Model3DController {
  /**
   * API: Lấy danh sách model 3D
   */
  async getAllModels(req, res) {
    try {
      const models = await Model3DService.getAllModels();
      
      return res.status(200).json({
        success: true,
        data: models,
        message: 'Lấy danh sách model 3D thành công'
      });
    } catch (error) {
      LoggerService.error(`Lỗi lấy danh sách model 3D: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * API: Lấy thông tin model 3D theo ID
   */
  async getModelById(req, res) {
    try {
      const { id } = req.params;
      const model = await Model3DService.getModelById(id);
      
      return res.status(200).json({
        success: true,
        data: model,
        message: 'Lấy thông tin model 3D thành công'
      });
    } catch (error) {
      LoggerService.error(`Lỗi lấy thông tin model 3D: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * API: Tạo model 3D mới
   */
  async createModel(req, res) {
    try {
      const userId = req.user?.id;
      const modelData = req.body;
      
      // Xử lý upload file nếu có
      if (req.file) {
        const uploadResult = await Model3DService.uploadModel(req.file);
        modelData.url = uploadResult.url;
        modelData.publicId = uploadResult.publicId;
      }
      
      const newModel = await Model3DService.createModel(modelData, userId);
      
      return res.status(201).json({
        success: true,
        data: newModel,
        message: 'Tạo model 3D thành công'
      });
    } catch (error) {
      LoggerService.error(`Lỗi tạo model 3D: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * API: Cập nhật model 3D
   */
  async updateModel(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const modelData = req.body;
      
      // Xử lý upload file nếu có
      if (req.file) {
        const uploadResult = await Model3DService.uploadModel(req.file);
        modelData.url = uploadResult.url;
        modelData.publicId = uploadResult.publicId;
      }
      
      const updatedModel = await Model3DService.updateModel(id, modelData, userId);
      
      return res.status(200).json({
        success: true,
        data: updatedModel,
        message: 'Cập nhật model 3D thành công'
      });
    } catch (error) {
      LoggerService.error(`Lỗi cập nhật model 3D: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * API: Xóa model 3D
   */
  async deleteModel(req, res) {
    try {
      const { id } = req.params;
      
      await Model3DService.deleteModel(id);
      
      return res.status(200).json({
        success: true,
        message: 'Xóa model 3D thành công'
      });
    } catch (error) {
      LoggerService.error(`Lỗi xóa model 3D: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * ADMIN: Render trang danh sách model 3D
   */
  async renderModelList(req, res) {
    try {
      const models = await Model3DService.getAllModels();
      
      return res.render('admin/model3d/index', {
        title: 'Quản lý Model 3D',
        models,
        path: '/admin/model3d',
        messages: req.flash(),
        user: req.user // Thêm biến user vào đây
      });
    } catch (error) {
      LoggerService.error(`Lỗi render trang quản lý model 3D: ${error.message}`);
      req.flash('error', error.message);
      return res.redirect('/admin');
    }
  }

  /**
   * ADMIN: Render trang tạo model 3D mới
   */
  async renderCreateModel(req, res) {
    try {
      return res.render('admin/model3d/create', {
        title: 'Thêm Model 3D mới',
        path: '/admin/model3d/create',
        messages: req.flash(),
        user: req.user // Thêm biến user vào đây
      });
    } catch (error) {
      LoggerService.error(`Lỗi render trang tạo model 3D: ${error.message}`);
      req.flash('error', error.message);
      return res.redirect('/admin/model3d');
    }
  }

  /**
   * ADMIN: Render trang chỉnh sửa model 3D
   */
  async renderEditModel(req, res) {
    try {
      const { id } = req.params;
      const model = await Model3DService.getModelById(id);
      
      return res.render('admin/model3d/edit', {
        title: 'Chỉnh sửa Model 3D',
        model,
        path: '/admin/model3d/edit',
        messages: req.flash(),
        user: req.user // Thêm biến user vào đây
      });
    } catch (error) {
      LoggerService.error(`Lỗi render trang chỉnh sửa model 3D: ${error.message}`);
      req.flash('error', error.message);
      return res.redirect('/admin/model3d');
    }
  }
}

module.exports = new Model3DController();