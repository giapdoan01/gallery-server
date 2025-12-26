/**
 * Model3D Model - Sử dụng Supabase
 */
const supabase = require('../config/database');
const LoggerService = require('../services/logger.service');

class Model3DModel {
  /**
   * Tạo model 3D mới
   */
  async create(modelData) {
    try {
      const { data, error } = await supabase
        .from('model3d')
        .insert([
          {
            name: modelData.name,
            url: modelData.url,
            author: modelData.author,
            description: modelData.description,
            rotation_x: modelData.rotationX || 0,
            rotation_y: modelData.rotationY || 0,
            rotation_z: modelData.rotationZ || 0,
            position_x: modelData.positionX || 0,
            position_y: modelData.positionY || 0,
            position_z: modelData.positionZ || 0,
            scale_x: modelData.scaleX || 1,
            scale_y: modelData.scaleY || 1,
            scale_z: modelData.scaleZ || 1,
            public_id: modelData.publicId || null,
            created_by: modelData.createdBy || null
          }
        ])
        .select();

      if (error) {
        LoggerService.error(`Lỗi tạo model 3D: ${error.message}`);
        throw new Error(`Không thể tạo model 3D: ${error.message}`);
      }

      LoggerService.success(`Đã tạo model 3D mới: ${data[0].name}`);
      return data[0];
    } catch (error) {
      LoggerService.error(`Lỗi tạo model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xóa model 3D
   */
  async destroy(id) {
    try {
      const { data: model, error: fetchError } = await supabase
        .from('model3d')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        LoggerService.error(`Lỗi lấy thông tin model 3D: ${fetchError.message}`);
        throw new Error(`Không thể lấy thông tin model 3D: ${fetchError.message}`);
      }

      if (!model) {
        throw new Error(`Không tìm thấy model 3D với ID ${id}`);
      }

      const { error } = await supabase
        .from('model3d')
        .delete()
        .eq('id', id);

      if (error) {
        LoggerService.error(`Lỗi xóa model 3D: ${error.message}`);
        throw new Error(`Không thể xóa model 3D: ${error.message}`);
      }

      LoggerService.success(`Đã xóa model 3D: ${model.name}`);
      return { success: true, message: `Model 3D ${model.name} đã được xóa thành công` };
    } catch (error) {
      LoggerService.error(`Lỗi xóa model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy tất cả model 3D
   */
  async findAll(options = {}) {
    try {
      let query = supabase.from('model3d').select('*');
      
      // Sắp xếp theo thứ tự mới nhất
      if (!options.orderBy) {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order(options.orderBy, { ascending: options.ascending !== false });
      }

      const { data, error } = await query;

      if (error) {
        LoggerService.error(`Lỗi lấy danh sách model 3D: ${error.message}`);
        throw new Error(`Không thể lấy danh sách model 3D: ${error.message}`);
      }

      return data;
    } catch (error) {
      LoggerService.error(`Lỗi lấy danh sách model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tìm model 3D theo ID
   */
  async findByPk(id) {
    try {
      const { data, error } = await supabase
        .from('model3d')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        LoggerService.error(`Lỗi tìm model 3D theo ID: ${error.message}`);
        throw new Error(`Không thể tìm model 3D: ${error.message}`);
      }

      return data;
    } catch (error) {
      LoggerService.error(`Lỗi tìm model 3D theo ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tìm một model 3D theo điều kiện
   */
  async findOne(options = {}) {
    try {
      let query = supabase.from('model3d').select('*');

      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query.limit(1).single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" which we don't consider an error
        LoggerService.error(`Lỗi tìm model 3D: ${error.message}`);
        throw new Error(`Không thể tìm model 3D: ${error.message}`);
      }

      return data;
    } catch (error) {
      LoggerService.error(`Lỗi tìm model 3D: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật model 3D
   */
  async update(id, modelData) {
    try {
      const updateData = {};
      
      // Chỉ cập nhật các trường được gửi đến
      if (modelData.name !== undefined) updateData.name = modelData.name;
      if (modelData.url !== undefined) updateData.url = modelData.url;
      if (modelData.author !== undefined) updateData.author = modelData.author;
      if (modelData.description !== undefined) updateData.description = modelData.description;
      if (modelData.rotationX !== undefined) updateData.rotation_x = modelData.rotationX;
      if (modelData.rotationY !== undefined) updateData.rotation_y = modelData.rotationY;
      if (modelData.rotationZ !== undefined) updateData.rotation_z = modelData.rotationZ;
      if (modelData.positionX !== undefined) updateData.position_x = modelData.positionX;
      if (modelData.positionY !== undefined) updateData.position_y = modelData.positionY;
      if (modelData.positionZ !== undefined) updateData.position_z = modelData.positionZ;
      if (modelData.scaleX !== undefined) updateData.scale_x = modelData.scaleX;
      if (modelData.scaleY !== undefined) updateData.scale_y = modelData.scaleY;
      if (modelData.scaleZ !== undefined) updateData.scale_z = modelData.scaleZ;
      if (modelData.publicId !== undefined) updateData.public_id = modelData.publicId;
      if (modelData.updatedBy !== undefined) updateData.updated_by = modelData.updatedBy;
      
      // Luôn cập nhật trường updated_at
      updateData.updated_at = new Date();

      const { data, error } = await supabase
        .from('model3d')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        LoggerService.error(`Lỗi cập nhật model 3D: ${error.message}`);
        throw new Error(`Không thể cập nhật model 3D: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error(`Không tìm thấy model 3D với ID ${id}`);
      }

      LoggerService.success(`Đã cập nhật model 3D: ${data[0].name}`);
      return data[0];
    } catch (error) {
      LoggerService.error(`Lỗi cập nhật model 3D: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new Model3DModel();