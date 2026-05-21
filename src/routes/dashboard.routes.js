import { Router } from 'express';
import {
  getIndividualDashboard,
  getFirmDashboard,
  getAdminDashboard,
  getLeaderboard,
} from '../controllers/dashboard.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

/**
 * @swagger
 * /api/dashboard/leaderboard:
 *   get:
 *     operationId: getPlatformLeaderboard
 *     summary: Retrieve top users leaderboard
 *     description: Returns the top 20 platform members ranked by aggregate loyalty points accumulated.
 *     tags: [Dashboards]
 *     security: []
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get('/leaderboard', asyncHandler(getLeaderboard));

/**
 * @swagger
 * /api/dashboard/individual:
 *   get:
 *     operationId: getIndividualUserDashboard
 *     summary: Individual/Corporate buyer dashboard
 *     description: Retrieve key environmental stats (CO2 offset totals, trees equivalent), gamification level metrics, and transaction summaries.
 *     tags: [Dashboards]
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/individual', verifyToken, requireRole('individual', 'corporate'), asyncHandler(getIndividualDashboard));

/**
 * @swagger
 * /api/dashboard/firm:
 *   get:
 *     operationId: getFirmUserDashboard
 *     summary: Project developer (Firm) dashboard
 *     description: Detailed project summaries, total volume traded, and gross earnings breakdown.
 *     tags: [Dashboards]
 *     responses:
 *       200:
 *         description: Firm dashboard retrieved successfully
 */
router.get('/firm', verifyToken, requireRole('firm'), asyncHandler(getFirmDashboard));

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     operationId: getAdminPlatformDashboard
 *     summary: Platform administrator KPI dashboard
 *     description: High-level KPI aggregations (system revenue, user breakdowns, validation queues).
 *     tags: [Dashboards]
 *     responses:
 *       200:
 *         description: Admin metrics retrieved successfully
 */
router.get('/admin', verifyToken, requireRole('admin'), asyncHandler(getAdminDashboard));

export default router;
