/**
 * API Routes - Auth
 */

import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody, validateRequired } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/signup', validateBody, validateRequired('email', 'password', 'firstName'), AuthController.signUp);
router.post('/signin', validateBody, validateRequired('email', 'password'), AuthController.signIn);

// Protected routes
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.post('/2fa/setup', authenticateToken, AuthController.setup2FA);
router.post('/2fa/enable', authenticateToken, validateBody, validateRequired('secret', 'verificationToken'), AuthController.enable2FA);
router.post('/change-password', authenticateToken, validateBody, validateRequired('currentPassword', 'newPassword'), AuthController.changePassword);

export default router;
