require('dotenv').config();

const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024,
  uploadPath: process.env.UPLOAD_PATH || 'uploads',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT) || 465,
  smtpUser: process.env.MAIL_USER,
  smtpPass: process.env.MAIL_PASS,
  frontendUrl: process.env.FRONTEND_URL || 'https://system.pallottipresse.com',
};

module.exports = env;
