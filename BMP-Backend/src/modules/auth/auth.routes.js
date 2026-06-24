import express from "express";
import {
  signupController,
  loginController,
  firebaseLoginController,
  updateUserProfile,
  getProfileController,
  uploadProfilePhotoController,
  updatePasswordController,
  forgotPasswordController,
  logoutController,
} from "./auth.controller.js";

import { uploadProfile } from "../../utils/fileUpload.util.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { loginLimiter, signupLimiter, sensitiveLimiter, profileLimiter, otpGenerationLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with INDIVIDUAL and TRAVELLER roles
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or duplicate email/phone
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/firebase-login:
 *   post:
 *     summary: Firebase authentication
 *     description: Login or signup using Firebase token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - provider
 *             properties:
 *               token:
 *                 type: string
 *                 description: Firebase ID token
 *               provider:
 *                 type: string
 *                 description: OAuth provider (google, facebook)
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Request OTP for password reset (Step 1) or reset password with OTP (Step 2)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - email
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: user@example.com
 *               - type: object
 *                 required:
 *                   - email
 *                   - otp
 *                   - newPassword
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   otp:
 *                     type: string
 *                     example: '123456'
 *                   newPassword:
 *                     type: string
 *                     format: password
 *                     example: 'NewPass@123'
 *     responses:
 *       200:
 *         description: Operation successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid OTP or email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                         kycStatus:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Update user profile
 *     description: Update authenticated user's profile information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/profile/photo:
 *   post:
 *     summary: Upload profile photo
 *     description: Upload or update user profile photo
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Profile photo (max 5MB)
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         avatar_url:
 *                           type: string
 *                           example: '/uploads/profiles/photo.jpg'
 *       400:
 *         description: Invalid file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update profile photo
 *     description: Replace existing profile photo
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @swagger
 * /api/auth/update-password:
 *   put:
 *     summary: Update password
 *     description: Change user password (requires current password)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: 'OldPass@123'
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: 'NewPass@456'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid old password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate JWT token (blacklist)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Public routes with rate limiting
router.post("/signup", signupLimiter, signupController);
router.post("/login", loginLimiter, loginController);
router.post("/firebase-login", loginLimiter, firebaseLoginController);

// Forgot password (public — single endpoint handles both steps)
router.post("/forgot-password", otpGenerationLimiter, forgotPasswordController);

// Protected routes
router.get("/profile", authMiddleware, getProfileController);
router.put("/update-profile", authMiddleware, profileLimiter, updateUserProfile);

// Sensitive routes with stricter rate limiting
// PUT /profile/photo is the canonical endpoint — POST variant removed (duplicate)
router.put("/profile/photo", authMiddleware, sensitiveLimiter, uploadProfile.single("photo"), uploadProfilePhotoController);
router.put("/update-password", authMiddleware, profileLimiter, sensitiveLimiter, updatePasswordController);

// Logout (protected)
router.post("/logout", authMiddleware, logoutController);

export default router;