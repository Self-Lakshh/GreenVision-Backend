import { Router } from 'express';
import {
  listRewards,
  getRewardDetails,
  createReward,
  updateReward,
  deleteReward,
  getMyRedemptions,
} from '../controllers/reward.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createRewardSchema, updateRewardSchema } from '../validators/reward.validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

/**
 * @swagger
 * /api/rewards:
 *   get:
 *     operationId: listActiveRewards
 *     summary: Browse active rewards
 *     description: Returns a list of active marketplace reward goodies that can be purchased with loyalty points.
 *     tags: [Rewards]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [merchandise, experience, digital, donation, offset_bundle]
 *         description: Reward category
 *       - in: query
 *         name: maxPoints
 *         schema:
 *           type: integer
 *         description: Maximum points required
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
 *         description: Active rewards list retrieved successfully
 */
router.get('/', asyncHandler(listRewards));

/**
 * @swagger
 * /api/rewards/redemptions/mine:
 *   get:
 *     operationId: getOwnRedemptions
 *     summary: Retrieve own reward redemptions
 *     description: Returns point redemption logs from in-app notifications history.
 *     tags: [Rewards]
 *     responses:
 *       200:
 *         description: Redemption history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/redemptions/mine', verifyToken, asyncHandler(getMyRedemptions));

/**
 * @swagger
 * /api/rewards/{id}:
 *   get:
 *     operationId: getSingleRewardDetails
 *     summary: View single reward details
 *     description: Retrieves details of a single active reward listing by ID.
 *     tags: [Rewards]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reward ID
 *     responses:
 *       200:
 *         description: Reward retrieved successfully
 *       404:
 *         description: Reward not found
 */
router.get('/:id', asyncHandler(getRewardDetails));

/**
 * @swagger
 * /api/rewards:
 *   post:
 *     operationId: createRewardListing
 *     summary: Create a new reward item (Admin)
 *     description: Add a new redemption option to the loyalty points store. Requires admin role.
 *     tags: [Rewards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category, pointsRequired]
 *             properties:
 *               name: { type: string, example: "Organic Cotton Nirmal T-Shirt" }
 *               description: { type: string, example: "Ethically sourced, 100% organic cotton printed tee." }
 *               category: { type: string, enum: [merchandise, experience, digital, donation, offset_bundle], example: merchandise }
 *               pointsRequired: { type: number, example: 1000 }
 *               imageUrl: { type: string, example: "https://example.com/tee.jpg" }
 *               stock: { type: number, example: 50 }
 *               partnerName: { type: string, example: "GreenMerch Inc." }
 *     responses:
 *       201:
 *         description: Reward created successfully
 *       403:
 *         description: Forbidden (role mismatch)
 */
router.post('/', verifyToken, requireRole('admin'), validate(createRewardSchema), asyncHandler(createReward));

/**
 * @swagger
 * /api/rewards/{id}:
 *   put:
 *     operationId: updateRewardListing
 *     summary: Update a reward item (Admin)
 *     description: Modify details or change stock of a points store listing. Requires admin role.
 *     tags: [Rewards]
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
 *             properties:
 *               name: { type: string }
 *               pointsRequired: { type: number }
 *               stock: { type: number }
 *     responses:
 *       200:
 *         description: Reward updated successfully
 */
router.put('/:id', verifyToken, requireRole('admin'), validate(updateRewardSchema), asyncHandler(updateReward));

/**
 * @swagger
 * /api/rewards/{id}:
 *   delete:
 *     operationId: archiveRewardListing
 *     summary: Soft-delete a reward item (Admin)
 *     description: Soft-delete a reward by setting isActive=false and setting a deletedAt date. Requires admin role.
 *     tags: [Rewards]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reward soft-deleted successfully
 */
router.delete('/:id', verifyToken, requireRole('admin'), asyncHandler(deleteReward));

export default router;
