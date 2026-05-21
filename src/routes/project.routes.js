import { Router } from 'express';
import {
  listProjects,
  getProjectDetails,
  searchProjects,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  verifyProject,
  rejectProject,
} from '../controllers/project.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  createProjectSchema,
  updateProjectSchema,
  searchProjectSchema,
} from '../validators/project.validator.js';
import { rejectProjectSchema } from '../validators/admin.validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     operationId: listVerifiedProjects
 *     summary: List verified projects
 *     description: Retrieve all verified offset projects. Filterable by type, location, price, text query, and sort options.
 *     tags: [Projects]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reforestation, solar, wind, biogas, mangrove, other]
 *         description: Project offset type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Match location name (case-insensitive regex)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum credit price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum credit price
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
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
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, price_asc, price_desc, impact]
 *         description: Sort ordering
 *     responses:
 *       200:
 *         description: Verified projects list retrieved
 */
router.get('/', asyncHandler(listProjects));

/**
 * @swagger
 * /api/projects/mine:
 *   get:
 *     operationId: getFirmOwnProjects
 *     summary: Retrieve own firm projects
 *     description: Returns projects owned by the currently logged-in firm user, alongside sales aggregates.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Firm projects list retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (role mismatch)
 */
router.get('/mine', verifyToken, requireRole('firm'), asyncHandler(getMyProjects));

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     operationId: getSingleProjectDetails
 *     summary: Retrieve single project details
 *     description: Fetches full details for a single project including details about the listing firm.
 *     tags: [Projects]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get('/:id', asyncHandler(getProjectDetails));

/**
 * @swagger
 * /api/projects/search:
 *   post:
 *     operationId: searchTextProjects
 *     summary: Text-based index search
 *     description: Performs text index relevance-ranked searches over title and description fields.
 *     tags: [Projects]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query: { type: string, example: "mangrove" }
 *     responses:
 *       200:
 *         description: Search results returned successfully
 */
router.post('/search', validate(searchProjectSchema), asyncHandler(searchProjects));

/**
 * @swagger
 * /api/projects:
 *   post:
 *     operationId: registerNewProject
 *     summary: Submit a new carbon credit project
 *     description: Register a new project listing with pending status. Requires firm role.
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location, projectType, totalCredits, pricePerCredit, startDate]
 *             properties:
 *               title: { type: string, example: "Sundarbans Mangrove Conservation" }
 *               description: { type: string, example: "Protecting and planting mangrove ecosystems in the Sundarbans." }
 *               location: { type: string, example: "West Bengal, India" }
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   latitude: { type: number, example: 21.94 }
 *                   longitude: { type: number, example: 89.18 }
 *               projectType: { type: string, enum: [reforestation, solar, wind, biogas, mangrove, other], example: mangrove }
 *               totalCredits: { type: number, example: 5000 }
 *               pricePerCredit: { type: number, example: 850 }
 *               co2Impact: { type: number, example: 5000 }
 *               treesEquivalent: { type: number, example: 20000 }
 *               startDate: { type: string, format: date, example: "2024-01-01" }
 *               endDate: { type: string, format: date, example: "2025-01-01" }
 *               tags: { type: array, items: { type: string }, example: ["blue-carbon", "mangrove", "ngo"] }
 *     responses:
 *       201:
 *         description: Project submitted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (role mismatch)
 */
router.post('/', verifyToken, requireRole('firm'), validate(createProjectSchema), asyncHandler(createProject));

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     operationId: updateDraftProject
 *     summary: Update project details
 *     description: Modify details of a project in draft or rejected status.
 *     tags: [Projects]
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
 *               title: { type: string }
 *               description: { type: string }
 *               pricePerCredit: { type: number }
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid state for updates
 */
router.put('/:id', verifyToken, requireRole('firm'), validate(updateProjectSchema), asyncHandler(updateProject));

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     operationId: archiveProjectListing
 *     summary: Soft-delete project listing
 *     description: Soft-delete project listing by setting a deletedAt flag. Requires project ownership or admin role.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 */
router.delete('/:id', verifyToken, requireRole('firm', 'admin'), asyncHandler(deleteProject));

/**
 * @swagger
 * /api/projects/{id}/verify:
 *   post:
 *     operationId: verifyPendingProject
 *     summary: Approve and publish project listing
 *     description: Administrative route to verify a pending project and publish it to the marketplace.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project verified and published successfully
 */
router.post('/:id/verify', verifyToken, requireRole('admin'), asyncHandler(verifyProject));

/**
 * @swagger
 * /api/projects/{id}/reject:
 *   post:
 *     operationId: rejectPendingProject
 *     summary: Reject project listing with feedback
 *     description: Administrative route to reject a pending project with a feedback reason.
 *     tags: [Projects]
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
 *             required: [reason]
 *             properties:
 *               reason: { type: string, example: "Verification documents are blurry and unreadable." }
 *     responses:
 *       200:
 *         description: Project rejected successfully
 */
router.post('/:id/reject', verifyToken, requireRole('admin'), validate(rejectProjectSchema), asyncHandler(rejectProject));

export default router;
