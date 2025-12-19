const { createClient } = require('@supabase/supabase-js');
const LoggerService = require('../services/logger.service');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Kiểm tra biến môi trường
if (!supabaseUrl || !supabaseKey) {
  LoggerService.error('SUPABASE_URL hoặc SUPABASE_KEY chưa được thiết lập');
  LoggerService.error('Hãy kiểm tra file .env của bạn');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;