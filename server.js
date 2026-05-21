import app from './src/app.js';
import connectDB from './src/config/db.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Listen on specified PORT
    app.listen(PORT, () => {
      logger.info(`Nirmal Carbon Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error(`Critical error starting Nirmal Carbon server: ${error.message}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  // Close server & exit process gracefully if needed, but in production just log
});

// Handle uncaught exceptions globally
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

startServer();
