/**
 * Authentication Middleware
 * JWT verification and role-based access control
 */

import { verifyToken } from '../utils/auth.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

/**
 * Verify JWT token middleware
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) {
    return next(new AuthenticationError('Access token required'));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return next(new AuthenticationError('Invalid or expired token'));
  }

  req.user = decoded;
  next();
};

/**
 * Role-based access control middleware
 * @param {...string} allowedRoles - Roles that have access
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Only ${allowedRoles.join(', ')} can access this resource`
        )
      );
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Does not require auth but sets req.user if token exists
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};
