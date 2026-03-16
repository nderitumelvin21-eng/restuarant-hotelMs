/**
 * Analytics Service
 * Revenue tracking, performance metrics, fraud detection
 */

import pool from '../config/database.js';

export class AnalyticsService {
  /**
   * Get revenue for a date range
   */
  static async getRevenueByDateRange(startDate, endDate) {
    const result = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        SUM(amount) as daily_revenue,
        COUNT(*) as transaction_count,
        AVG(amount) as average_transaction
       FROM payments 
       WHERE created_at >= $1 AND created_at <= $2
       AND status = 'completed'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [startDate, endDate]
    );

    return result.rows;
  }

  /**
   * Get revenue by waiter
   */
  static async getRevenueByWaiter(startDate, endDate) {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT o.id) as orders_served,
        SUM(p.amount) as total_revenue,
        AVG(p.amount) as average_order_value
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN users u ON o.waiter_id = u.id
       WHERE p.created_at >= $1 AND p.created_at <= $2
       AND p.status = 'completed'
       GROUP BY u.id, u.first_name, u.last_name
       ORDER BY total_revenue DESC`,
      [startDate, endDate]
    );

    return result.rows;
  }

  /**
   * Get top selling dishes
   */
  static async getTopSellingDishes(limit = 10, startDate, endDate) {
    const result = await pool.query(
      `SELECT 
        m.id,
        m.name,
        m.category,
        m.price,
        COUNT(oi.id) as times_sold,
        SUM(oi.quantity * oi.unit_price) as total_revenue,
        AVG(m.price) as average_price
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.created_at >= $1 AND o.created_at <= $2
       AND o.status != 'cancelled'
       GROUP BY m.id, m.name, m.category, m.price
       ORDER BY total_revenue DESC
       LIMIT $3`,
      [startDate, endDate, limit]
    );

    return result.rows;
  }

  /**
   * Get table turnover analytics
   */
  static async getTableTurnover(limit = 30) {
    const result = await pool.query(
      `SELECT 
        t.table_number,
        COUNT(DISTINCT o.id) as total_orders,
        AVG(EXTRACT(EPOCH FROM (o.served_at - o.confirmed_at)) / 60)::INT as avg_service_time_minutes,
        SUM(p.amount) as total_revenue
       FROM tables t
       LEFT JOIN orders o ON t.id = o.table_id
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE p.status = 'completed'
       GROUP BY t.id, t.table_number
       ORDER BY total_revenue DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  /**
   * Get waiter performance metrics
   */
  static async getWaiterPerformance(waiterId, startDate, endDate) {
    const result = await pool.query(
      `SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as orders_served,
        SUM(p.amount) as revenue,
        AVG(p.amount) as avg_order_value,
        COUNT(CASE WHEN o.served_at <= o.ready_at + interval '5 minutes' THEN 1 END) as on_time_orders
       FROM orders o
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.waiter_id = $1
       AND o.created_at >= $2
       AND o.created_at <= $3
       GROUP BY DATE(o.created_at)
       ORDER BY date DESC`,
      [waiterId, startDate, endDate]
    );

    return result.rows;
  }

  /**
   * Detect fraud patterns
   */
  static async detectFraudPatterns() {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.amount,
        p.method,
        p.fraud_score,
        p.created_at,
        o.table_id,
        o.order_number,
        COUNT(*) OVER (PARTITION BY o.customer_id) as customer_transaction_count,
        SUM(p.amount) OVER (PARTITION BY o.customer_id, DATE(p.created_at)) as customer_daily_total
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.status = 'completed'
       AND p.created_at >= CURRENT_DATE - interval '30 days'
       ORDER BY p.fraud_score DESC
       LIMIT 100`
    );

    return result.rows;
  }

  /**
   * Calculate fraud risk score
   */
  static calculateFraudRisk(paymentData) {
    let score = 0;

    const { amount, method, customer_daily_total, customer_transaction_count } =
      paymentData;

    // Large transactions flag
    if (amount > 500) score += 20;
    if (amount > 1000) score += 30;

    // Multiple transactions in short time
    if (customer_transaction_count > 5) score += 15;

    // High daily spending
    if (customer_daily_total > 2000) score += 15;

    // Cash payments are higher risk
    if (method === 'cash' && amount > 200) score += 10;

    // Determine risk level
    let riskLevel = 'low';
    if (score > 70) riskLevel = 'critical';
    else if (score > 50) riskLevel = 'high';
    else if (score > 25) riskLevel = 'medium';

    return {
      score: Math.min(score, 100),
      riskLevel,
    };
  }

  /**
   * Get daily summary
   */
  static async getDailySummary(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM tables WHERE status = 'occupied') as occupied_tables,
        (SELECT COUNT(*) FROM reservations WHERE DATE(reservation_date) = $1 AND status IN ('pending', 'confirmed')) as reservations_today,
        (SELECT SUM(amount) FROM payments WHERE DATE(created_at) = $1 AND status = 'completed') as revenue,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1 AND status = 'completed') as completed_orders,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = $1 AND status = 'cancelled') as cancelled_orders
       LIMIT 1`,
      [dateStr]
    );

    return result.rows[0] || {};
  }

  /**
   * Get customer insights
   */
  static async getCustomerInsights() {
    const result = await pool.query(
      `SELECT 
        vip_tier,
        COUNT(*) as customer_count,
        AVG(total_spent) as avg_spending,
        AVG(total_visits) as avg_visits,
        AVG(loyalty_points) as avg_loyalty_points
       FROM customers
       GROUP BY vip_tier
       ORDER BY vip_tier`
    );

    return result.rows;
  }
}
