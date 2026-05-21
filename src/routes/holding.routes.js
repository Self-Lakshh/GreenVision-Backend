import { Router } from 'express';
import {
  listHoldings,
  getHoldingForProject,
  retireCredits,
} from '../controllers/holding.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { retireHoldingSchema } from '../validators/holding.validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// Secure all holdings routes
router.use(verifyToken);

/**
 * @swagger
 * /api/holdings:
 *   get:
 *     operationId: getUserHoldings
 *     summary: Retrieve own carbon credit portfolio
 *     description: Returns a detailed list of all carbon credit holdings for the logged-in user, populated with project details.
 *     tags: [Holdings]
 *     responses:
 *       200:
 *         description: Carbon credit holdings list retrieved successfully
 */
router.get('/', asyncHandler(listHoldings));

/**
 * @swagger
 * /api/holdings/{projectId}:
 *   get:
 *     operationId: getHoldingForProjectID
 *     summary: Get holdings details for a specific project
 *     description: Returns credit ownership metrics for one specific project, populated with project definitions.
 *     tags: [Holdings]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Credit holdings details retrieved
 */
router.get('/:projectId', asyncHandler(getHoldingForProject));

/**
 * @swagger
 * /api/holdings/retire:
 *   post:
 *     operationId: retireCarbonCredits
 *     summary: Retire carbon credits (Corporates)
 *     description: Offsets carbon emissions permanently by retiring owned credits. Restricts to corporate accounts. Inserts in-app redemption updates.
 *     tags: [Holdings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, credits]
 *             properties:
 *               projectId: { type: string, example: "660c1d6833fe60113c2ea689" }
 *               credits: { type: number, example: 2.5 }
 *     responses:
 *       200:
 *         description: Credits retired successfully
 *       400:
 *         description: Insufficient credits to retire
 *       403:
 *         description: Forbidden (role mismatch)
 */
router.post('/retire', requireRole('corporate'), validate(retireHoldingSchema), asyncHandler(retireCredits));

export default router;
