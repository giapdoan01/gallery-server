// Script để dọn dẹp các ảnh trùng lặp trên Cloudinary

require('dotenv').config();
const { cloudinary } = require('../config/cloudinary');
const LoggerService = require('../services/logger.service');

async function cleanupDuplicateImages() {
  try {
    LoggerService.info('Starting Cloudinary duplicate images cleanup...');
    
    // Lấy tất cả resources trong thư mục artgallery
    const folderResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'artgallery/',
      max_results: 500
    });
    
    LoggerService.info(`Found ${folderResult.resources.length} images in artgallery folder`);
    
    // Lấy tất cả resources ở thư mục gốc
    const rootResult = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500
    });
    
    LoggerService.info(`Found ${rootResult.resources.length} images in root folder`);
    
    // Tìm các ảnh trùng lặp (cùng tên nhưng khác folder)
    const folderImages = folderResult.resources.map(r => ({
      public_id: r.public_id,
      filename: r.public_id.split('/').pop(),
      url: r.url
    }));
    
    const rootImages = rootResult.resources.filter(r => !r.public_id.includes('/')).map(r => ({
      public_id: r.public_id,
      filename: r.public_id,
      url: r.url
    }));
    
    // Tìm các tên file trùng lặp
    const duplicates = [];
    for (const folderImage of folderImages) {
      const matchingRoot = rootImages.find(r => r.filename === folderImage.filename);
      if (matchingRoot) {
        duplicates.push({
          folder: folderImage,
          root: matchingRoot
        });
      }
    }
    
    LoggerService.info(`Found ${duplicates.length} duplicate images`);
    
    // Xóa các bản sao ở thư mục gốc
    for (const dup of duplicates) {
      LoggerService.info(`Deleting duplicate image: ${dup.root.public_id}`);
      try {
        const result = await cloudinary.uploader.destroy(dup.root.public_id);
        LoggerService.success(`Deleted ${dup.root.public_id}, result: ${JSON.stringify(result)}`);
      } catch (error) {
        LoggerService.error(`Failed to delete ${dup.root.public_id}: ${error.message}`);
      }
    }
    
    LoggerService.success('Cleanup completed!');
    return { processed: duplicates.length };
  } catch (error) {
    LoggerService.error(`Cleanup failed: ${error.message}`);
    return { error: error.message };
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  cleanupDuplicateImages()
    .then(result => {
      console.log('Cleanup result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Cleanup error:', error);
      process.exit(1);
    });
}

module.exports = cleanupDuplicateImages;