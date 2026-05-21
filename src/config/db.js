import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nirmal_carbon';
    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
