import { Router } from 'express';
import {
  listAllUsers,
  updateUserRole,
  toggleUserSuspension,
  getPendingProjects,
  listAllTransactions,
  getPlatformAnalytics,
} from '../controllers/admin.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateRoleSchema } from '../validators/admin.validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// Protect all admin endpoints
router.use(verifyToken, requireRole('admin'));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     operationId: getAllPlatformUsers
 *     summary: List platform users
 *     description: Retrieve all users registered on Nirmal Carbon. Filter by role or search text query.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [individual, firm, corporate, admin]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or companyName
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 */
router.get('/users', asyncHandler(listAllUsers));

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     operationId: changeUserProfileRole
 *     summary: Change user role
 *     description: Directly configure a user's system security role (individual, firm, corporate, admin).
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [individual, firm, corporate, admin], example: firm }
 *     responses:
 *       200:
 *         description: User role updated successfully
 */
router.put('/users/:id/role', validate(updateRoleSchema), asyncHandler(updateUserRole));

/**
 * @swagger
 * /api/admin/users/{id}/suspend:
 *   put:
 *     operationId: suspendUserProfileAccount
 *     summary: Toggle user suspension
 *     description: Deactivates or reactivates a user's account. Suspended users cannot authenticate.
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User suspension state toggled successfully
 */
router.put('/users/:id/suspend', asyncHandler(toggleUserSuspension));

/**
 * @swagger
 * /api/admin/projects/pending:
 *   get:
 *     operationId: getPlatformPendingListings
 *     summary: View pending projects review queue
 *     description: Retrieve all projects awaiting administrative review or verification.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Pending review queue list retrieved successfully
 */
router.get('/projects/pending', asyncHandler(getPendingProjects));

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     operationId: listGlobalTransactionsHistory
 *     summary: List all transactions (Admin)
 *     description: Retrieve detailed paginated list of all payment transactions made across the platform.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Global transactions history retrieved
 */
router.get('/transactions', asyncHandler(listAllTransactions));

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     operationId: listGlobalPlatformAnalytics
 *     summary: Aggregated platform analytics
 *     description: Fetch deep statistics on user breakdown, monthly trade volumes, and project distribution profiles.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Analytics summaries retrieved successfully
 */
router.get('/analytics', asyncHandler(getPlatformAnalytics));

export default router;
