import { Router } from 'express';
import {
  listTransactions,
  getTransactionDetails,
  getCertificate,
} from '../controllers/transaction.controller.js';
import { verifyToken } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// Secure all transaction routes
router.use(verifyToken);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     operationId: getUserTransactionsList
 *     summary: Retrieve own transactions list
 *     description: Returns a paginated list of carbon credit purchase transactions for the current user.
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
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
 *         description: Transactions retrieved successfully
 */
router.get('/', asyncHandler(listTransactions));

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     operationId: getSingleTransactionDetails
 *     summary: Get single transaction details
 *     description: Retrieves detailed transaction details, populated with project and buyer profiles. Restrict to buyers or platform admins.
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', asyncHandler(getTransactionDetails));

/**
 * @swagger
 * /api/transactions/{id}/certificate:
 *   get:
 *     operationId: getTransactionCertificateUrl
 *     summary: Get transaction offset certificate details
 *     description: Returns the URL of the generated PDF carbon credit certificate for a completed transaction.
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Certificate details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     certificateUrl: { type: string }
 *       400:
 *         description: Certificate has not been generated yet
 */
router.get('/:id/certificate', asyncHandler(getCertificate));

export default router;
