/**
 * Request Validation Middleware
 */

import { ValidationError } from '../utils/errors.js';

/**
 * Validate request body exists
 */
export const validateBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ValidationError('Request body is required'));
  }
  next();
};

/**
 * Validate required fields
 * @param {...string} requiredFields - Fields that must be present
 */
export const validateRequired = (...requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter((field) => !req.body[field]);

    if (missing.length > 0) {
      return next(
        new ValidationError('Missing required fields', {
          fields: missing,
        })
      );
    }

    next();
  };
};

/**
 * Validate query parameters
 * @param {object} schema - Validation schema { fieldName: validator }
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const errors = {};

    for (const [field, validator] of Object.entries(schema)) {
      if (req.query[field] && !validator(req.query[field])) {
        errors[field] = `Invalid ${field}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(
        new ValidationError('Invalid query parameters', {
          errors,
        })
      );
    }

    next();
  };
};
