import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import projectRoutes from './project.routes.js';
import paymentRoutes from './payment.routes.js';
import transactionRoutes from './transaction.routes.js';
import holdingRoutes from './holding.routes.js';
import rewardRoutes from './reward.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/payments', paymentRoutes);
router.use('/transactions', transactionRoutes);
router.use('/holdings', holdingRoutes);
router.use('/rewards', rewardRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

export default router;
