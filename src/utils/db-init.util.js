// src/utils/db-init.util.js
const bcrypt = require('bcryptjs');
const LoggerService = require('../services/logger.service');
const UserModel = require('../model/User.model');

/**
 * Kiểm tra xem đã có tài khoản admin chưa
 */
async function checkAdminExists() {
  try {
    const admins = await UserModel.findAll({ role: 'admin' });
    return admins && admins.length > 0;
  } catch (error) {
    LoggerService.error('Failed to check admin existence:', error.message);
    throw error;
  }
}

/**
 * Tạo tài khoản admin mặc định
 */
async function createDefaultAdmin() {
  try {
    const adminData = {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      isActive: true
    };
    
    const admin = await UserModel.create(adminData);
    
    LoggerService.success('Default admin account created:');
    LoggerService.info('Username: admin');
    LoggerService.info('Password: admin123');
    
    return admin;
  } catch (error) {
    LoggerService.error('Failed to create default admin:', error.message);
    throw error;
  }
}

/**
 * Khởi tạo dữ liệu cơ bản
 */
async function initDatabase() {
  try {
    LoggerService.info('Checking for admin user...');
    
    // Kiểm tra và tạo admin nếu cần
    const adminExists = await checkAdminExists();
    
    if (!adminExists) {
      LoggerService.info('No admin user found, creating default admin...');
      await createDefaultAdmin();
    } else {
      LoggerService.info('Admin user already exists');
    }
    
    LoggerService.success('Database initialization completed');
    return true;
  } catch (error) {
    LoggerService.error('Database initialization failed:', error.message);
    // Không throw lỗi để ứng dụng vẫn chạy được
    return false;
  }
}

module.exports = {
  initDatabase,
  checkAdminExists,
  createDefaultAdmin
};