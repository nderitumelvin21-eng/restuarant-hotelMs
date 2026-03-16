/**
 * Authentication Service
 * User signup, login, token management
 */

import { UserModel } from '../models/UserModel.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generate2FASecret,
  verify2FAToken,
} from '../utils/auth.js';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors.js';
import { isValidEmail, isValidPassword, isValidPhone } from '../utils/validators.js';
import { CustomerModel } from '../models/CustomerModel.js';

export class AuthService {
  /**
   * Sign up a new customer
   */
  static async signUp(userData) {
    const { email, password, phone, firstName, lastName } = userData;

    // Validate input
    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email address');
    }

    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError('Password does not meet requirements', {
        errors: passwordValidation.errors,
      });
    }

    if (phone && !isValidPhone(phone)) {
      throw new ValidationError('Invalid phone number');
    }

    // Check if email exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
      email,
      password_hash: passwordHash,
      phone,
      first_name: firstName,
      last_name: lastName,
      role: 'customer',
    });

    // Create customer profile
    await CustomerModel.create({
      user_id: user.id,
      phone,
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Sign in user
   */
  static async signIn(email, password, twoFAToken = null) {
    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check 2FA if enabled
    if (user.two_fa_enabled) {
      if (!twoFAToken) {
        return {
          requiresTwoFA: true,
          userId: user.id,
        };
      }

      const isValidToken = verify2FAToken(user.two_fa_secret, twoFAToken);
      if (!isValidToken) {
        throw new AuthenticationError('Invalid 2FA token');
      }
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Setup 2FA for user
   */
  static async setup2FA(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    const { secret, qrCode } = await generate2FASecret(user.email);

    return {
      secret,
      qrCode,
    };
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId, secret, verificationToken) {
    // Verify the token matches the secret
    const isValid = verify2FAToken(secret, verificationToken);
    if (!isValid) {
      throw new ValidationError('Invalid verification token');
    }

    // Enable 2FA in database
    const user = await UserModel.enable2FA(userId, secret);

    return {
      message: '2FA enabled successfully',
      user,
    };
  }

  /**
   * Change password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    // Get user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    // Verify current password
    const passwordMatch = await comparePassword(currentPassword, user.password_hash);
    if (!passwordMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError('New password does not meet requirements', {
        errors: passwordValidation.errors,
      });
    }

    // Hash and update
    const newPasswordHash = await hashPassword(newPassword);
    await UserModel.changePassword(userId, newPasswordHash);

    return {
      message: 'Password changed successfully',
    };
  }
}
