import 'dotenv/config'; // ensure .env is loaded by the loader itself

import http from 'http';
import mongoose from 'mongoose';

(async () => {
  // ✅ runtime imports happen *after* dotenv is loaded
  const { default: connectDB } = await import('./config/database');
  const { default: app } = await import('./app');
  const logger = (await import('./utils/logger')).default;

  const requiredEnv = ['MONGODB_URI', 'JWT_ACCESS_TOKEN_SECRET'];
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      console.error(`❌ Missing required env var: ${key}`);
      process.exit(1);
    }
  }

  const PORT = process.env['PORT'] ? Number(process.env['PORT']) : 8000;

  try {
    await connectDB();
    console.log('✅ Mongo connected');

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
      logger.info(`Server running on port ${PORT} in ${process.env['NODE_ENV'] || 'development'} mode`);
    });

    const shutdown = async (signal: string) => {
      try {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        await new Promise<void>((resolve) => server.close(() => resolve()));
        await mongoose.disconnect();
        console.log('👋 Bye.');
        process.exit(0);
      } catch (err) {
        console.error('Forced shutdown due to error:', err);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
      logger.error('Unhandled Rejection:', reason);
    });
    
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
})();
