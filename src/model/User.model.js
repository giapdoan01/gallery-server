const bcrypt = require('bcryptjs');
const supabase = require('../config/database');

/**
 * User Model - Sử dụng Supabase
 */
class UserModel {
  /**
   * Tạo người dùng mới
   * @param {Object} userData Dữ liệu người dùng
   */
  static async create(userData) {
    // Mã hóa mật khẩu trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        password: hashedPassword,
        role: userData.role || 'admin',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select();
      
    if (error) throw error;
    return data[0];
  }
  
  /**
   * Tìm người dùng theo ID
   */
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }
  
  /**
   * Tìm người dùng theo tên đăng nhập
   */
  static async findByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116: Không tìm thấy
    return data;
  }
  
  /**
   * Kiểm tra mật khẩu
   */
  static async comparePassword(hashedPassword, candidatePassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
  
  /**
   * Cập nhật thông tin người dùng
   */
  static async update(id, updateData) {
    updateData.updated_at = new Date();
    
    // Mã hóa mật khẩu nếu được cung cấp
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  }
  
  /**
   * Xóa người dùng
   */
  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
  
  /**
   * Lấy danh sách người dùng
   */
  static async findAll(options = {}) {
    const query = supabase.from('users').select('*');
    
    // Xử lý phân trang nếu có
    if (options.limit) query.limit(options.limit);
    if (options.offset) query.offset(options.offset);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

module.exports = UserModel;