/**
 * Input Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (simple validation)
 * @param {string} phone - Phone to validate
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid, errors }
 */
export const isValidPassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate table number
 * @param {number} tableNumber - Table number
 * @returns {boolean}
 */
export const isValidTableNumber = (tableNumber) => {
  return Number.isInteger(tableNumber) && tableNumber > 0 && tableNumber <= 1000;
};

/**
 * Validate currency amount
 * @param {number} amount - Amount to validate
 * @returns {boolean}
 */
export const isValidAmount = (amount) => {
  return !isNaN(amount) && amount > 0 && Number.isFinite(amount);
};
