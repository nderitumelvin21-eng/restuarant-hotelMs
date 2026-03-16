/**
 * Order Model
 */

import pool from '../config/database.js';

export class OrderModel {
  /**
   * Create a new order
   */
  static async create(orderData) {
    const {
      order_number,
      table_id,
      customer_id,
      waiter_id,
      total_amount,
      special_notes,
    } = orderData;

    const result = await pool.query(
      `INSERT INTO orders 
       (order_number, table_id, customer_id, waiter_id, total_amount, special_notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [order_number, table_id, customer_id, waiter_id, total_amount, special_notes]
    );

    return result.rows[0] || null;
  }

  /**
   * Get order by ID
   */
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get order by order number
   */
  static async findByOrderNumber(orderNumber) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE order_number = $1`,
      [orderNumber]
    );
    return result.rows[0] || null;
  }

  /**
   * Get orders for a table
   */
  static async getByTableId(tableId) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE table_id = $1 ORDER BY created_at DESC`,
      [tableId]
    );
    return result.rows;
  }

  /**
   * Get active orders (not completed/cancelled)
   */
  static async getActiveOrders() {
    const result = await pool.query(
      `SELECT o.*, 
              json_agg(json_build_object('id', oi.id, 'menu_item_id', oi.menu_item_id, 'quantity', oi.quantity, 'status', oi.status)) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.status NOT IN ('completed', 'cancelled')
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    return result.rows;
  }

  /**
   * Get orders by status
   */
  static async getByStatus(status) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC`,
      [status]
    );
    return result.rows;
  }

  /**
   * Update order status
   */
  static async updateStatus(orderId, status) {
    let updateFields = 'status = $2';
    let params = [orderId, status];

    if (status === 'confirmed') {
      updateFields += ', confirmed_at = CURRENT_TIMESTAMP';
    } else if (status === 'ready') {
      updateFields += ', ready_at = CURRENT_TIMESTAMP';
    } else if (status === 'served') {
      updateFields += ', served_at = CURRENT_TIMESTAMP';
    } else if (status === 'completed') {
      updateFields += ', completed_at = CURRENT_TIMESTAMP';
    }

    const result = await pool.query(
      `UPDATE orders 
       SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      params
    );

    return result.rows[0] || null;
  }

  /**
   * Get orders with items
   */
  static async getWithItems(orderId) {
    const result = await pool.query(
      `SELECT o.*,
              json_agg(json_build_object(
                'id', oi.id,
                'menu_item_id', oi.menu_item_id,
                'menu_item_name', mi.name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'status', oi.status
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [orderId]
    );

    return result.rows[0] || null;
  }

  /**
   * Add item to order
   */
  static async addItem(orderId, menuItemId, quantity, unitPrice, specialInstructions) {
    const result = await pool.query(
      `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, special_instructions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orderId, menuItemId, quantity, unitPrice, specialInstructions]
    );

    return result.rows[0] || null;
  }

  /**
   * Update order total
   */
  static async updateTotal(orderId, totalAmount, discount = 0) {
    const result = await pool.query(
      `UPDATE orders 
       SET total_amount = $2, discount = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [orderId, totalAmount, discount]
    );

    return result.rows[0] || null;
  }

  /**
   * Get orders for today
   */
  static async getTodayOrders() {
    const result = await pool.query(
      `SELECT * FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  /**
   * Calculate average order value
   */
  static async getAverageOrderValue() {
    const result = await pool.query(
      `SELECT AVG(total_amount) as average_value FROM orders WHERE status = 'completed'`
    );
    return parseFloat(result.rows[0]?.average_value || 0);
  }

  /**
   * Get orders by waiter
   */
  static async getByWaiterId(waiterId) {
    const result = await pool.query(
      `SELECT * FROM orders WHERE waiter_id = $1 ORDER BY created_at DESC`,
      [waiterId]
    );
    return result.rows;
  }

  /**
   * Get kitchen queue (orders to be prepared)
   */
  static async getKitchenQueue() {
    const result = await pool.query(
      `SELECT o.*,
              json_agg(json_build_object(
                'id', oi.id,
                'menu_item_id', oi.menu_item_id,
                'menu_item_name', mi.name,
                'quantity', oi.quantity,
                'status', oi.status,
                'special_instructions', oi.special_instructions,
                'preparation_time', mi.preparation_time_minutes
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
       WHERE o.status IN ('confirmed', 'preparing')
       AND oi.status IN ('pending', 'preparing')
       GROUP BY o.id
       ORDER BY o.created_at ASC`
    );

    return result.rows;
  }
}
