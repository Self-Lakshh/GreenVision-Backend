import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

dotenv.config();

// Load local configurations
import swaggerSpec from './config/swagger.js';
import rootRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authLimiter, apiLimiter, paymentLimiter } from './middleware/rateLimiter.js';

const app = express();

// Secure headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  })
);

// Prevent HTTP parameter pollution
app.use(hpp());

// Logging middleware
app.use(morgan('combined'));

// IMPORTANT: Webhook route needs raw body parser, mount before standard JSON parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Standard body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static asset folders
app.use('/uploads', express.static('uploads'));

// API documentation mounting
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Apply Route limits
app.use('/api/auth', authLimiter);
app.use('/api/payments', paymentLimiter);
app.use('/api', apiLimiter);

// Mount main application router
app.use('/api', rootRouter);

// Global exception catches
app.use(errorHandler);

export default app;
export { app };
