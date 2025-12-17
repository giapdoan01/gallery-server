const User = require('../model/User.model');
const { sequelize } = require('../config/database');
const config = require('../config/config');

async function initDatabase() {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
    
    // Kiểm tra xem đã có user admin chưa
    const adminExists = await User.findOne({
      where: { username: config.defaultAdminUser }
    });
    
    // Nếu chưa có, tạo user admin mặc định
    if (!adminExists) {
      await User.create({
        username: config.defaultAdminUser,
        password: config.defaultAdminPassword,
        role: 'admin'
      });
      console.log('✅ Default admin user created');
    }
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Nếu gọi trực tiếp file này
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Init script failed:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };