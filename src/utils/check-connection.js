const supabase = require('../config/database');
const LoggerService = require('../services/logger.service');

/**
 * Kiểm tra kết nối đến Supabase
 */
async function checkSupabaseConnection() {
  try {
    LoggerService.info('Đang kiểm tra kết nối đến Supabase...');
    
    // Truy vấn version của PostgreSQL để kiểm tra kết nối
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      LoggerService.error('Không thể kết nối đến Supabase:', error.message);
      return false;
    }
    
    // Kiểm tra truy cập bảng users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (usersError) {
      LoggerService.error('Không thể truy cập bảng users:', usersError.message);
      return false;
    }
    
    LoggerService.success(`Kết nối đến Supabase thành công! PostgreSQL version: ${data}`);
    return true;
  } catch (error) {
    LoggerService.error('Lỗi kiểm tra kết nối:', error.message);
    return false;
  }
}

module.exports = { checkSupabaseConnection };