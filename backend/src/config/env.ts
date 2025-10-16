import { config } from 'dotenv';

// Load environment variables
config();

export const env = {
  NODE_ENV: process.env['NODE_ENV'] || 'development',
  PORT: parseInt(process.env['PORT'] || '3000'),
  
  // Database
  MONGODB_URI: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/lvl-ai',
  MONGODB_TEST_URI: process.env['MONGODB_TEST_URI'] || 'mongodb://localhost:27017/lvl-ai-test',
  
  // JWT
  JWT_SECRET: process.env['JWT_SECRET'] || 'fallback-secret-key',
  JWT_ACCESS_TOKEN_SECRET: process.env['JWT_ACCESS_TOKEN_SECRET'] || process.env['JWT_SECRET'] || 'fallback-secret-key',
  JWT_EXPIRE: process.env['JWT_EXPIRE'] || '7d',
  JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret',
  JWT_REFRESH_EXPIRE: process.env['JWT_REFRESH_EXPIRE'] || '30d',
  
  // Email
  EMAIL_HOST: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env['EMAIL_PORT'] || '587'),
  EMAIL_USER: process.env['EMAIL_USER'] || '',
  EMAIL_PASS: process.env['EMAIL_PASS'] || '',
  
  // CORS
  CORS_ORIGIN: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env['MAX_FILE_SIZE'] || '5242880'),
  UPLOAD_PATH: process.env['UPLOAD_PATH'] || 'uploads/',
  
  // Logging
  LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',
  LOG_FILE: process.env['LOG_FILE'] || 'logs/app.log',
  
  // AI/OpenRouter
  OPENROUTER_API_KEY: process.env['OPENROUTER_API_KEY'] || '',
  
  // AI/DeepSeek
  DEEPSEEK_API_KEY: process.env['DEEPSEEK_API_KEY'] || ''
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';