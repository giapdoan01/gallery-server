const AuthService = require('../services/auth.service');
const ResponseUtil = require('../utils/response.util');

/**
 * Middleware xác thực JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header hoặc cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    
    if (!token) {
      return ResponseUtil.error(res, 'Không có quyền truy cập, vui lòng đăng nhập', 401);
    }
    
    // Xác thực token
    const decoded = await AuthService.verifyToken(token);
    
    // Đính kèm thông tin user vào request
    req.user = decoded;
    next();
  } catch (error) {
    return ResponseUtil.error(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
  }
};

module.exports = { authMiddleware };