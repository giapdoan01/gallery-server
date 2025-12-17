// src/utils/db-init.util.js
const { sequelize } = require('../config/database');
const config = require('../config/config');
const LoggerService = require('../services/logger.service');
const bcrypt = require('bcryptjs');

/**
 * Khởi tạo mô hình User cho Admin
 */
function defineUserModel() {
  const { DataTypes } = require('sequelize');
  
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'admin',
      validate: {
        isIn: [['admin', 'editor']]
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });
  
  // Phương thức so sánh mật khẩu
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };
  
  return User;
}

/**
 * Khởi tạo mô hình Image cho quản lý ảnh
 */
function defineImageModel() {
  const { DataTypes } = require('sequelize');
  
  const Image = sequelize.define('Image', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true // Cho phép URL trống
    },
    frameUse: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true // Đảm bảo số frame không trùng nhau
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: true // ID của ảnh trên Cloudinary
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lastUpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });
  
  return Image;
}

/**
 * Hàm khởi tạo database
 */
async function initDatabase() {
  try {
    // Đồng bộ hóa model với database
    const User = defineUserModel();
    const Image = defineImageModel();
    
    await sequelize.sync();
    LoggerService.success('Database synchronized');
    
    // Kiểm tra xem đã có tài khoản admin chưa
    const adminCount = await User.count();
    
    if (adminCount === 0) {
      // Tạo tài khoản admin mặc định
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      
      LoggerService.success('Default admin account created:');
      LoggerService.info('Username: admin');
      LoggerService.info('Password: admin123');
    }
    
    return true;
  } catch (error) {
    LoggerService.error('Failed to initialize database:', error.message);
    throw error;
  }
}

module.exports = {
  initDatabase,
  defineUserModel,
  defineImageModel
};