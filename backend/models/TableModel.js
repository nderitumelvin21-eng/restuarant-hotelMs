/**
 * Table Model
 */

import pool from '../config/database.js';

export class TableModel {
  /**
   * Create a new table
   */
  static async create(tableData) {
    const {
      table_number,
      capacity,
      floor_position_x,
      floor_position_y,
      floor_position_z,
    } = tableData;

    const result = await pool.query(
      `INSERT INTO tables (table_number, capacity, floor_position_x, floor_position_y, floor_position_z)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [table_number, capacity, floor_position_x, floor_position_y, floor_position_z]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all tables
   */
  static async getAll() {
    const result = await pool.query(
      `SELECT * FROM tables ORDER BY table_number ASC`
    );
    return result.rows;
  }

  /**
   * Get table by ID
   */
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM tables WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get table by number
   */
  static async findByNumber(tableNumber) {
    const result = await pool.query(
      `SELECT * FROM tables WHERE table_number = $1`,
      [tableNumber]
    );
    return result.rows[0] || null;
  }

  /**
   * Update table status
   */
  static async updateStatus(tableId, status) {
    const result = await pool.query(
      `UPDATE tables 
       SET status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [tableId, status]
    );
    return result.rows[0] || null;
  }

  /**
   * Mark table as occupied
   */
  static async markOccupied(tableId, occupancy) {
    const result = await pool.query(
      `UPDATE tables 
       SET status = 'occupied',
           current_occupancy = $2,
           occupied_since = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [tableId, occupancy]
    );
    return result.rows[0] || null;
  }

  /**
   * Mark table as free
   */
  static async markFree(tableId) {
    const result = await pool.query(
      `UPDATE tables 
       SET status = 'free',
           current_occupancy = 0,
           occupied_since = NULL,
           reservation_id = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [tableId]
    );
    return result.rows[0] || null;
  }

  /**
   * Mark table as cleaning
   */
  static async markCleaning(tableId) {
    const result = await pool.query(
      `UPDATE tables 
       SET status = 'cleaning',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [tableId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get available tables for a given capacity
   */
  static async getAvailable(guestCount) {
    const result = await pool.query(
      `SELECT * FROM tables 
       WHERE status = 'free' AND capacity >= $1
       ORDER BY capacity ASC`,
      [guestCount]
    );
    return result.rows;
  }

  /**
   * Get table status summary
   */
  static async getStatusSummary() {
    const result = await pool.query(
      `SELECT 
        status, 
        COUNT(*) as count 
       FROM tables 
       GROUP BY status`
    );
    return result.rows;
  }

  /**
   * Update table position
   */
  static async updatePosition(tableId, x, y, z) {
    const result = await pool.query(
      `UPDATE tables 
       SET floor_position_x = $2,
           floor_position_y = $3,
           floor_position_z = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [tableId, x, y, z]
    );
    return result.rows[0] || null;
  }

  /**
   * Get table occupancy time in minutes
   */
  static async getOccupancyTime(tableId) {
    const result = await pool.query(
      `SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - occupied_since)) / 60 as minutes
       FROM tables 
       WHERE id = $1 AND status = 'occupied'`,
      [tableId]
    );
    return result.rows[0]?.minutes || 0;
  }

  /**
   * Delete table
   */
  static async delete(tableId) {
    await pool.query(`DELETE FROM tables WHERE id = $1`, [tableId]);
  }
}
