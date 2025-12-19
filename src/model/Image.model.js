const supabase = require('../config/database');
const LoggerService = require('../services/logger.service');

/**
 * Image Model - Sử dụng Supabase
 */
class ImageModel {
  /**
   * Lấy tất cả hình ảnh
   */
  static async findAll(options = {}) {
    try {
      let query = supabase.from('images').select('*');
      
      // Xử lý sắp xếp
      if (options.order && options.order.length > 0) {
        const [field, direction] = options.order[0];
        query = query.order(field, { ascending: direction === 'ASC' });
      } else {
        // Mặc định sắp xếp theo frameUse tăng dần
        query = query.order('frameUse', { ascending: true });
      }
      
      // Xử lý where
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      // Xử lý limit/offset
      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Chuyển đổi snake_case thành camelCase cho tương thích với giao diện
      return data.map(image => ({
        id: image.id,
        name: image.name,
        url: image.url,
        frameUse: image.frameUse,
        publicId: image.publicId,
        createdAt: image.created_at,
        updatedAt: image.updated_at,
        createdBy: image.createdBy,
        lastUpdatedBy: image.lastUpdatedBy
      }));
    } catch (error) {
      LoggerService.error('Error getting images:', error.message);
      throw error;
    }
  }
  
  /**
   * Tìm hình ảnh theo ID
   */
  static async findByPk(id) {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') return null; // Không tìm thấy
        throw error;
      }
      
      if (!data) return null;
      
      // Chuyển đổi sang camelCase
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        frameUse: data.frameUse,
        publicId: data.publicId,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.createdBy,
        lastUpdatedBy: data.lastUpdatedBy
      };
    } catch (error) {
      LoggerService.error(`Error finding image with ID ${id}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Tìm một hình ảnh theo điều kiện
   */
  static async findOne(options = {}) {
    try {
      let query = supabase.from('images').select('*');
      
      if (options.where) {
        Object.entries(options.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      query = query.limit(1).single();
      
      const { data, error } = await query;
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Không tìm thấy
        throw error;
      }
      
      if (!data) return null;
      
      // Chuyển đổi sang camelCase
      return {
        id: data.id,
        name: data.name,
        url: data.url,
        frameUse: data.frameUse,
        publicId: data.publicId,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.createdBy,
        lastUpdatedBy: data.lastUpdatedBy
      };
    } catch (error) {
      LoggerService.error('Error finding image with conditions:', error.message);
      throw error;
    }
  }
  
  /**
   * Tạo hình ảnh mới
   */
  static async create(imageData) {
    try {
      const { data, error } = await supabase
        .from('images')
        .insert({
          name: imageData.name,
          url: imageData.url,
          frameUse: imageData.frameUse,
          publicId: imageData.publicId,
          createdBy: imageData.createdBy,
          lastUpdatedBy: imageData.lastUpdatedBy
        })
        .select();
        
      if (error) throw error;
      
      // Chuyển đổi sang camelCase
      const image = data[0];
      return {
        id: image.id,
        name: image.name,
        url: image.url,
        frameUse: image.frameUse,
        publicId: image.publicId,
        createdAt: image.created_at,
        updatedAt: image.updated_at,
        createdBy: image.createdBy,
        lastUpdatedBy: image.lastUpdatedBy
      };
    } catch (error) {
      LoggerService.error('Error creating image:', error.message);
      throw error;
    }
  }
  
  /**
   * Cập nhật hình ảnh
   */
  static async update(id, imageData) {
    try {
      const { data, error } = await supabase
        .from('images')
        .update({
          name: imageData.name,
          url: imageData.url,
          frameUse: imageData.frameUse,
          publicId: imageData.publicId,
          lastUpdatedBy: imageData.lastUpdatedBy
        })
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      // Chuyển đổi sang camelCase
      const image = data[0];
      return {
        id: image.id,
        name: image.name,
        url: image.url,
        frameUse: image.frameUse,
        publicId: image.publicId,
        createdAt: image.created_at,
        updatedAt: image.updated_at,
        createdBy: image.createdBy,
        lastUpdatedBy: image.lastUpdatedBy
      };
    } catch (error) {
      LoggerService.error(`Error updating image with ID ${id}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Xóa hình ảnh
   */
  static async destroy(id) {
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      LoggerService.error(`Error deleting image with ID ${id}:`, error.message);
      throw error;
    }
  }
}

module.exports = ImageModel;