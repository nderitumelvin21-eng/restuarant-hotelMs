/**
 * Customer Model
 */

import pool from '../config/database.js';

export class CustomerModel {
  /**
   * Create a new customer profile
   */
  static async create(customerData) {
    const { user_id, phone } = customerData;

    const result = await pool.query(
      `INSERT INTO customers (user_id, phone)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, phone]
    );

    return result.rows[0] || null;
  }

  /**
   * Find customer by user ID
   */
  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT * FROM customers WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Find customer by phone
   */
  static async findByPhone(phone) {
    const result = await pool.query(
      `SELECT * FROM customers WHERE phone = $1`,
      [phone]
    );
    return result.rows[0] || null;
  }

  /**
   * Get customer profile with user info
   */
  static async getProfile(customerId) {
    const result = await pool.query(
      `SELECT c.*, u.email, u.first_name, u.last_name, u.phone as user_phone
       FROM customers c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [customerId]
    );
    return result.rows[0] || null;
  }

  /**
   * Update customer profile
   */
  static async update(customerId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(customerId);

    const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Increment visit count and update spending
   */
  static async recordVisit(customerId, orderAmount) {
    const result = await pool.query(
      `UPDATE customers 
       SET total_visits = total_visits + 1,
           total_spent = total_spent + $2,
           average_order = total_spent / total_visits,
           last_visit = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [customerId, orderAmount]
    );
    return result.rows[0] || null;
  }

  /**
   * Get VIP customers
   */
  static async getVIPCustomers() {
    const result = await pool.query(
      `SELECT * FROM customers 
       WHERE vip_tier IN ('gold', 'platinum')
       ORDER BY total_spent DESC`
    );
    return result.rows;
  }

  /**
   * Update VIP tier based on spending
   */
  static async updateVIPTier(customerId) {
    const result = await pool.query(
      `SELECT total_spent FROM customers WHERE id = $1`,
      [customerId]
    );

    if (result.rows.length === 0) return null;

    const spent = result.rows[0].total_spent;
    let tier = 'bronze';

    if (spent > 5000) tier = 'platinum';
    else if (spent > 2500) tier = 'gold';
    else if (spent > 1000) tier = 'silver';

    const updateResult = await pool.query(
      `UPDATE customers SET vip_tier = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [customerId, tier]
    );

    return updateResult.rows[0] || null;
  }

  /**
   * Add to favorite dishes
   */
  static async addFavoriteDish(customerId, dishName) {
    const result = await pool.query(
      `UPDATE customers 
       SET favorite_dishes = array_append(favorite_dishes, $2),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND NOT favorite_dishes @> ARRAY[$2]
       RETURNING *`,
      [customerId, dishName]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all customers
   */
  static async getAll(limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Get customer count
   */
  static async getCount() {
    const result = await pool.query(`SELECT COUNT(*) FROM customers`);
    return parseInt(result.rows[0].count) || 0;
  }
}
