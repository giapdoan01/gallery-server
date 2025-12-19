const UserModel = require('../model/User.model');
const AuthService = require('../services/auth.service');
const LoggerService = require('../services/logger.service');

class AdminController {
  /**
   * Render trang đăng nhập
   */
  static renderLogin(req, res) {
    res.render('admin/login', { 
      title: 'Đăng nhập - Admin ArtGallery',
      error: req.flash('error'),
      layout: 'layouts/admin-layout'
    });
  }
  
  /**
   * Xử lý đăng nhập
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
        return res.redirect('/admin/login');
      }
      
      const auth = await AuthService.login(username, password);
      
      // Set token vào cookie
      res.cookie('token', auth.token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      
      return res.redirect('/admin');
    } catch (error) {
      LoggerService.error('Login error:', error.message);
      req.flash('error', error.message);
      return res.redirect('/admin/login');
    }
  }
  
  /**
   * Xử lý đăng xuất
   */
  static logout(req, res) {
    res.clearCookie('token');
    return res.redirect('/admin/login');
  }
  
  /**
   * Render trang dashboard
   */
  static renderDashboard(req, res) {
    res.render('admin/dashboard', {
      title: 'Dashboard - Admin ArtGallery',
      user: req.user,
      path: '/admin',
      layout: 'layouts/admin-layout'
    });
  }
}

module.exports = AdminController;