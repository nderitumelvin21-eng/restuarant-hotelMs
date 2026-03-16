/**
 * Auth Controller
 * Handles user authentication and authorization
 */

import { AuthService } from '../services/AuthService.js';

export class AuthController {
  /**
   * Sign up endpoint
   * POST /api/auth/signup
   */
  static async signUp(req, res, next) {
    try {
      const result = await AuthService.signUp(req.body);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Sign in endpoint
   * POST /api/auth/signin
   */
  static async signIn(req, res, next) {
    try {
      const { email, password, twoFAToken } = req.body;
      const result = await AuthService.signIn(email, password, twoFAToken);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Setup 2FA
   * POST /api/auth/2fa/setup
   */
  static async setup2FA(req, res, next) {
    try {
      const result = await AuthService.setup2FA(req.user.id);
      res.status(200).json({
        success: true,
        message: '2FA setup initiated',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Enable 2FA
   * POST /api/auth/2fa/enable
   */
  static async enable2FA(req, res, next) {
    try {
      const { secret, verificationToken } = req.body;
      const result = await AuthService.enable2FA(req.user.id, secret, verificationToken);

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Change password
   * POST /api/auth/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  static async getCurrentUser(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
}
