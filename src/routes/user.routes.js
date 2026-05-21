import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getNotifications,
  readNotification,
  readAllNotifications,
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { updateProfileSchema, updatePasswordSchema } from '../validators/user.validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// Secure all user routes with verifyToken
router.use(verifyToken);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     operationId: getUserProfile
 *     summary: Retrieve own profile
 *     description: Retrieve detailed user data for the current authenticated user, including gamification progress.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', asyncHandler(getProfile));

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     operationId: updateUserProfile
 *     summary: Update own profile
 *     description: Update profile fields such as phone, location, bio, or business identification.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string, example: "Kavya Reddy" }
 *               bio: { type: string, example: "Environmental enthusiast and green investor." }
 *               phone: { type: string, example: "+919876543210" }
 *               avatarUrl: { type: string, example: "https://example.com/avatar.jpg" }
 *               location: { type: string, example: "Bangalore, India" }
 *               panNumber: { type: string, example: "ABCDE1234F" }
 *               gstNumber: { type: string, example: "29ABCDE1234F1Z5" }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', validate(updateProfileSchema), asyncHandler(updateProfile));

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     operationId: changeUserPassword
 *     summary: Change user password
 *     description: Set a new login password after verifying the old password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password, example: SecurePass@123 }
 *               newPassword: { type: string, format: password, minLength: 8, example: NewSecurePass@999 }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Password mismatch or validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/password', validate(updatePasswordSchema), asyncHandler(changePassword));

/**
 * @swagger
 * /api/users/notifications:
 *   get:
 *     operationId: getUserNotifications
 *     summary: Get notifications
 *     description: Get current user notifications list (paginated).
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Max results per page
 *       - in: query
 *         name: unread
 *         schema:
 *           type: boolean
 *         description: Filter only unread notifications (true/false)
 *     responses:
 *       200:
 *         description: Notifications list retrieved
 */
router.get('/notifications', asyncHandler(getNotifications));

/**
 * @swagger
 * /api/users/notifications/read-all:
 *   put:
 *     operationId: readAllNotifications
 *     summary: Mark all notifications as read
 *     description: Utility to mark all of a user's notifications as read.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/notifications/read-all', asyncHandler(readAllNotifications));

/**
 * @swagger
 * /api/users/notifications/{id}/read:
 *   put:
 *     operationId: readSingleNotification
 *     summary: Mark one notification as read
 *     description: Sets the specified notification's read state to true.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/notifications/:id/read', asyncHandler(readNotification));

export default router;
