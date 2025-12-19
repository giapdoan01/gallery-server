const GalleryRoom = require('./src/colyseus/rooms/GalleryRoom');
const AdminGalleryRoom = require('./src/colyseus/rooms/AdminGalleryRoom');
const config = require('./src/config/config');

module.exports = {
  initializeGameServer: (gameServer) => {
    // Đăng ký room thông thường
    gameServer.define(config.roomName, GalleryRoom);
    
    // Đăng ký room admin mới - sử dụng tên từ config
    gameServer.define(config.adminRoomName, AdminGalleryRoom);
  }
};