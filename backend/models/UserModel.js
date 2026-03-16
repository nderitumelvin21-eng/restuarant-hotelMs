/**
 * User Model
 */

import pool from '../config/database.js';

export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData) {
    const { email, password_hash, phone, first_name, last_name, role } = userData;

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, phone, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, phone, first_name, last_name, role, created_at`,
      [email, password_hash, phone, first_name, last_name, role]
    );

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, role, status, two_fa_enabled, last_login, created_at 
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId) {
    const result = await pool.query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1 RETURNING last_login`,
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all users by role
   */
  static async findByRole(role) {
    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, role, status, last_login 
       FROM users WHERE role = $1 ORDER BY created_at DESC`,
      [role]
    );
    return result.rows;
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId, secret) {
    const result = await pool.query(
      `UPDATE users SET two_fa_enabled = TRUE, two_fa_secret = $2 WHERE id = $1 RETURNING *`,
      [userId, secret]
    );
    return result.rows[0] || null;
  }

  /**
   * Get 2FA secret
   */
  static async get2FASecret(userId) {
    const result = await pool.query(
      `SELECT two_fa_secret, two_fa_enabled FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Change password
   */
  static async changePassword(userId, newPasswordHash) {
    const result = await pool.query(
      `UPDATE users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email`,
      [userId, newPasswordHash]
    );
    return result.rows[0] || null;
  }
}
