/**
 * Reservation Model
 */

import pool from '../config/database.js';

export class ReservationModel {
  /**
   * Create a new reservation
   */
  static async create(reservationData) {
    const {
      customer_id,
      guest_count,
      reservation_date,
      reservation_time,
      customer_name,
      customer_phone,
      customer_email,
      special_requests,
    } = reservationData;

    const result = await pool.query(
      `INSERT INTO reservations 
       (customer_id, guest_count, reservation_date, reservation_time, customer_name, customer_phone, customer_email, special_requests)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        customer_id,
        guest_count,
        reservation_date,
        reservation_time,
        customer_name,
        customer_phone,
        customer_email,
        special_requests,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Get reservation by ID
   */
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM reservations WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get reservations for a date
   */
  static async getByDate(date) {
    const result = await pool.query(
      `SELECT * FROM reservations 
       WHERE reservation_date = $1 
       ORDER BY reservation_time ASC`,
      [date]
    );
    return result.rows;
  }

  /**
   * Get upcoming reservations
   */
  static async getUpcoming() {
    const result = await pool.query(
      `SELECT r.*, c.user_id, u.first_name, u.last_name
       FROM reservations r
       LEFT JOIN customers c ON r.customer_id = c.id
       LEFT JOIN users u ON c.user_id = u.id
       WHERE r.reservation_date >= CURRENT_DATE 
       AND r.status IN ('pending', 'confirmed')
       ORDER BY r.reservation_date, r.reservation_time ASC`
    );
    return result.rows;
  }

  /**
   * Update reservation status
   */
  static async updateStatus(reservationId, status) {
    const updateFields = ['status = $2'];
    const params = [reservationId, status];

    if (status === 'arrived') {
      updateFields.push('arrival_time = CURRENT_TIMESTAMP');
    }

    const result = await pool.query(
      `UPDATE reservations 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      params
    );

    return result.rows[0] || null;
  }

  /**
   * Assign table to reservation
   */
  static async assignTable(reservationId, tableId) {
    const result = await pool.query(
      `UPDATE reservations 
       SET table_id = $2,
           status = 'confirmed',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [reservationId, tableId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get pending reservations (not yet notified)
   */
  static async getPendingNotifications() {
    const result = await pool.query(
      `SELECT * FROM reservations 
       WHERE waiter_notified = FALSE 
       AND status IN ('pending', 'confirmed')
       AND reservation_date >= CURRENT_DATE
       ORDER BY reservation_date, reservation_time`
    );
    return result.rows;
  }

  /**
   * Mark reservation as notified
   */
  static async markNotified(reservationId) {
    const result = await pool.query(
      `UPDATE reservations 
       SET waiter_notified = TRUE
       WHERE id = $1
       RETURNING *`,
      [reservationId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get reservations by customer
   */
  static async getByCustomerId(customerId) {
    const result = await pool.query(
      `SELECT * FROM reservations 
       WHERE customer_id = $1 
       ORDER BY reservation_date DESC`,
      [customerId]
    );
    return result.rows;
  }

  /**
   * Cancel reservation
   */
  static async cancel(reservationId) {
    const result = await pool.query(
      `UPDATE reservations 
       SET status = 'cancelled',
           table_id = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [reservationId]
    );

    return result.rows[0] || null;
  }
}
