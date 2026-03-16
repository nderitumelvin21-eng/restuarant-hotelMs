/**
 * Payment Model
 */

import pool from '../config/database.js';

export class PaymentModel {
  /**
   * Create a new payment
   */
  static async create(paymentData) {
    const {
      order_id,
      split_bill_id,
      amount,
      method,
      reference_number,
      fraud_score,
      fraud_risk_level,
    } = paymentData;

    const result = await pool.query(
      `INSERT INTO payments 
       (order_id, split_bill_id, amount, method, reference_number, fraud_score, fraud_risk_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        order_id,
        split_bill_id,
        amount,
        method,
        reference_number,
        fraud_score,
        fraud_risk_level,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Get payment by ID
   */
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM payments WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get payments for an order
   */
  static async getByOrderId(orderId) {
    const result = await pool.query(
      `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC`,
      [orderId]
    );
    return result.rows;
  }

  /**
   * Update payment status
   */
  static async updateStatus(paymentId, status) {
    const updateFields = ['status = $2'];
    const params = [paymentId, status];

    if (status === 'completed') {
      updateFields.push('paid_at = CURRENT_TIMESTAMP');
    }

    const result = await pool.query(
      `UPDATE payments 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      params
    );

    return result.rows[0] || null;
  }

  /**
   * Get payments by date range
   */
  static async getByDateRange(startDate, endDate) {
    const result = await pool.query(
      `SELECT * FROM payments 
       WHERE created_at >= $1 AND created_at <= $2
       AND status = 'completed'
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  /**
   * Get total revenue for a date
   */
  static async getRevenueForDate(date) {
    const result = await pool.query(
      `SELECT SUM(amount) as total_revenue, COUNT(*) as transaction_count
       FROM payments 
       WHERE DATE(created_at) = $1
       AND status = 'completed'`,
      [date]
    );
    return result.rows[0] || { total_revenue: 0, transaction_count: 0 };
  }

  /**
   * Get revenue breakdown by payment method
   */
  static async getRevenueByMethod() {
    const result = await pool.query(
      `SELECT method, SUM(amount) as total, COUNT(*) as count
       FROM payments 
       WHERE status = 'completed'
       GROUP BY method`
    );
    return result.rows;
  }

  /**
   * Get high fraud risk transactions
   */
  static async getHighFraudRiskTransactions() {
    const result = await pool.query(
      `SELECT * FROM payments 
       WHERE fraud_risk_level IN ('high', 'critical')
       AND status = 'completed'
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return result.rows;
  }

  /**
   * Update fraud assessment
   */
  static async updateFraudAssessment(paymentId, fraudScore, riskLevel) {
    const result = await pool.query(
      `UPDATE payments 
       SET fraud_score = $2, fraud_risk_level = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [paymentId, fraudScore, riskLevel]
    );

    return result.rows[0] || null;
  }

  /**
   * Get failed payments
   */
  static async getFailedPayments() {
    const result = await pool.query(
      `SELECT * FROM payments 
       WHERE status = 'failed'
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return result.rows;
  }
}
