/**
 * Authentication Utilities
 * JWT generation, password hashing, 2FA
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Hash password with bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if passwords match
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 * @param {object} payload - Data to encode in token
 * @returns {string} - JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} - Decoded token or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) {
    return null;
  }
};

/**
 * Generate 2FA secret and QR code
 * @param {string} userEmail - User's email
 * @returns {Promise<object>} - { secret, qrCode }
 */
export const generate2FASecret = async (userEmail) => {
  const secret = speakeasy.generateSecret({
    name: `Restaurant Management (${userEmail})`,
    issuer: 'Restaurant Management System',
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode,
  };
};

/**
 * Verify 2FA token
 * @param {string} secret - User's 2FA secret
 * @param {string} token - 6-digit token from authenticator app
 * @returns {boolean} - True if token is valid
 */
export const verify2FAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: parseInt(process.env.TOTP_WINDOW || 1),
  });
};
