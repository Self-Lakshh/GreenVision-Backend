import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     operationId: registerUser
 *     summary: Register a new user
 *     description: Creates a new user account on Nirmal Carbon. Role defaults to 'individual'. Returns both JWT access and refresh tokens.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Kavya Reddy
 *               email:
 *                 type: string
 *                 format: email
 *                 example: kavya@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass@123
 *               role:
 *                 type: string
 *                 enum: [individual, firm, corporate]
 *                 default: individual
 *                 example: individual
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               companyName:
 *                 type: string
 *                 example: GreenEarth NGO
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Registration successful" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Validation error or missing fields
 *       409:
 *         description: Email already exists
 */
router.post('/register', validate(registerSchema), asyncHandler(register));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     operationId: loginUser
 *     summary: Authenticate user & login
 *     description: Authenticate credentials. Revokes all previous refresh tokens and issues a new access token (15m) + refresh token (7d).
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: kavya@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Login successful" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Account suspended
 */
router.post('/login', validate(loginSchema), asyncHandler(login));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     operationId: refreshToken
 *     summary: Refresh JWT access token
 *     description: Rotate JWT credentials by providing a valid, unexpired refresh token. Invalidates the used refresh token and issues a new pair.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: b4e37517c5b6b1076f8a8461a293c...
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Tokens refreshed successfully" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Refresh token invalid or expired
 */
router.post('/refresh', validate(refreshSchema), asyncHandler(refresh));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     operationId: logoutUser
 *     summary: Log out user & revoke token
 *     description: Revokes the specified refresh token in the database, effectively logging out the user's active session.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: b4e37517c5b6b1076f8a8461a293c...
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Refresh token is required
 */
router.post('/logout', verifyToken, validate(refreshSchema), asyncHandler(logout));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     operationId: getMe
 *     summary: Get current authenticated user
 *     description: Fetches current session details using JWT token authentication.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user profile retrieved
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
router.get('/me', verifyToken, asyncHandler(getMe));

export default router;
