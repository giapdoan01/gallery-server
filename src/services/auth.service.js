const jwt = require('jsonwebtoken');
const User = require('../model/User.model');
const config = require('../config/config');

// JWT Secret Key (nên đặt trong .env)
const JWT_SECRET = process.env.JWT_SECRET || 'art-gallery-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

class AuthService {
  /**
   * Login và tạo JWT token
   */
  static async login(username, password) {
    try {
      // Tìm user trong database
      const user = await User.findOne({ where: { username, isActive: true } });
      
      if (!user) {
        throw new Error('Tài khoản không tồn tại');
      }
      
      // Kiểm tra password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Mật khẩu không đúng');
      }
      
      // Tạo JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      return {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Xác thực token và trả về thông tin user
   */
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findOne({ where: { id: decoded.id, isActive: true } });
      
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Token không hợp lệ');
    }
  }
}

module.exports = AuthService;