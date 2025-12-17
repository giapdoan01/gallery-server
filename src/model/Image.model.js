// src/models/Image.model.js
const { defineImageModel } = require('../utils/db-init.util');

// Tạo và export Image model
const Image = defineImageModel();

module.exports = Image;