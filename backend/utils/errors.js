/**
 * Custom Error Classes
 */

export class APIError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class ValidationError extends APIError {
  constructor(message, details = null) {
    super(400, message, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Not found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends APIError {
  constructor(message, details = null) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

export const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('Error:', err);

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      timestamp: err.timestamp,
    });
  }

  // Unknown error
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date(),
  });
};
