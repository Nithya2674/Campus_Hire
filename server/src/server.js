import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import logger from './utils/logger.js';

// Validate critical environment configurations
const requiredEnv = ['JWT_SECRET'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar]) {
    logger.warn(`Missing recommended environment variable: ${envVar}. Using fallback.`);
  }
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 CampusHire Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`📡 Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        logger.info('Server and database connection terminated. Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
