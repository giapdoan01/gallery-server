// src/controllers/image.controller.js
const ImageService = require('../services/image.service');
const LoggerService = require('../services/logger.service');
const { upload } = require('../config/cloudinary');

class ImageController {
  /**
   * Render trang danh sách ảnh
   */
  static async renderImageList(req, res) {
    try {
      const images = await ImageService.getAllImages();
      
      res.render('admin/images/index', {
        title: 'Quản lý ảnh - Admin ArtGallery',
        user: req.user,
        path: '/admin/images',
        images,
        success: req.flash('success'),
        error: req.flash('error')
      });
    } catch (error) {
      LoggerService.error('Failed to render image list:', error.message);
      req.flash('error', `Lỗi: ${error.message}`);
      res.redirect('/admin');
    }
  }

  /**
   * Render trang tạo ảnh mới
   */
  static renderCreateImage(req, res) {
    res.render('admin/images/create', {
      title: 'Thêm ảnh mới - Admin ArtGallery',
      user: req.user,
      path: '/admin/images',
      error: req.flash('error')
    });
  }

  /**
   * Xử lý tạo ảnh mới
   */
  static async createImage(req, res) {
    try {
      const { 
        name, frameUse, author, description, 
        positionX, positionY, positionZ,
        rotationX, rotationY, rotationZ
      } = req.body;
      const userId = req.user.id;

      let imageData = {
        name,
        frameUse: parseInt(frameUse),
        author: author || '',
        description: description || '',
        // Thêm các trường vị trí và xoay
        positionX: parseFloat(positionX || 0),
        positionY: parseFloat(positionY || 0),
        positionZ: parseFloat(positionZ || 0),
        rotationX: parseFloat(rotationX || 0),
        rotationY: parseFloat(rotationY || 0),
        rotationZ: parseFloat(rotationZ || 0),
        url: '',
        publicId: ''
      };

      // Nếu có file được upload
      if (req.file) {
        const result = await ImageService.uploadImage(req.file);
        imageData.url = result.url;
        imageData.publicId = result.publicId;
      }

      await ImageService.createImage(imageData, userId);
      
      req.flash('success', 'Thêm ảnh thành công');
      res.redirect('/admin/images');
    } catch (error) {
      LoggerService.error('Failed to create image:', error.message);
      req.flash('error', `Lỗi: ${error.message}`);
      res.redirect('/admin/images/create');
    }
  }

  /**
   * Render trang chỉnh sửa ảnh
   */
  static async renderEditImage(req, res) {
    try {
      const { id } = req.params;
      const image = await ImageService.getImageById(id);

      if (!image) {
        req.flash('error', `Không tìm thấy ảnh với ID ${id}`);
        return res.redirect('/admin/images');
      }

      res.render('admin/images/edit', {
        title: 'Chỉnh sửa ảnh - Admin ArtGallery',
        user: req.user,
        path: '/admin/images',
        image,
        error: req.flash('error')
      });
    } catch (error) {
      LoggerService.error(`Failed to render edit page for image ${req.params.id}:`, error.message);
      req.flash('error', `Lỗi: ${error.message}`);
      res.redirect('/admin/images');
    }
  }

  /**
   * Xử lý cập nhật ảnh
   */
  static async updateImage(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, frameUse, author, description, 
        positionX, positionY, positionZ,
        rotationX, rotationY, rotationZ
      } = req.body;
      const userId = req.user.id;

      const image = await ImageService.getImageById(id);
      
      if (!image) {
        req.flash('error', `Không tìm thấy ảnh với ID ${id}`);
        return res.redirect('/admin/images');
      }

      let imageData = {
        name,
        frameUse: parseInt(frameUse),
        author: author || '',
        description: description || '',
        // Thêm các trường vị trí và xoay
        positionX: parseFloat(positionX || 0),
        positionY: parseFloat(positionY || 0),
        positionZ: parseFloat(positionZ || 0),
        rotationX: parseFloat(rotationX || 0),
        rotationY: parseFloat(rotationY || 0),
        rotationZ: parseFloat(rotationZ || 0),
        url: image.url,
        publicId: image.publicId
      };

      // Nếu có file được upload mới
      if (req.file) {
        // Xóa ảnh cũ trên Cloudinary nếu có
        if (image.publicId) {
          const { cloudinary } = require('../config/cloudinary');
          await cloudinary.uploader.destroy(image.publicId);
        }

        const result = await ImageService.uploadImage(req.file);
        imageData.url = result.url;
        imageData.publicId = result.publicId;
      }

      await ImageService.updateImage(id, imageData, userId);
      
      req.flash('success', 'Cập nhật ảnh thành công');
      res.redirect('/admin/images');
    } catch (error) {
      LoggerService.error(`Failed to update image ${req.params.id}:`, error.message);
      req.flash('error', `Lỗi: ${error.message}`);
      res.redirect(`/admin/images/edit/${req.params.id}`);
    }
  }

  /**
   * Xử lý xóa ảnh
   */
  static async deleteImage(req, res) {
    try {
      const { id } = req.params;
      
      await ImageService.deleteImage(id);
      
      req.flash('success', 'Xóa ảnh thành công');
      res.redirect('/admin/images');
    } catch (error) {
      LoggerService.error(`Failed to delete image ${req.params.id}:`, error.message);
      req.flash('error', `Lỗi: ${error.message}`);
      res.redirect('/admin/images');
    }
  }

  /**
   * API: Lấy ảnh theo frameUse
   */
  static async getImageByFrame(req, res) {
    try {
      const { frame } = req.params;
      const image = await ImageService.getImageByFrame(parseInt(frame));
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy ảnh cho frame ${frame}`
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: image.id,
          name: image.name,
          url: image.url,
          frameUse: image.frameUse,
          author: image.author,
          description: image.description,
          // Thêm các trường vị trí và xoay
          position: {
            x: image.positionX || 0,
            y: image.positionY || 0,
            z: image.positionZ || 0
          },
          rotation: {
            x: image.rotationX || 0,
            y: image.rotationY || 0,
            z: image.rotationZ || 0
          }
        }
      });
    } catch (error) {
      LoggerService.error(`API error - getImageByFrame ${req.params.frame}:`, error.message);
      return res.status(500).json({
        success: false,
        message: `Lỗi server: ${error.message}`
      });
    }
  }
}

module.exports = ImageController;