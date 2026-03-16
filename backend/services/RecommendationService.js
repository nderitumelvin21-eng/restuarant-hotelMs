/**
 * Recommendation Service
 * AI-powered dish recommendations based on order history and popularity
 */

import pool from '../config/database.js';

export class RecommendationService {
  /**
   * Generate recommendations for a customer
   */
  static async generateRecommendations(customerId, limit = 5) {
    try {
      // Get customer's order history
      const customerOrders = await pool.query(
        `SELECT oi.menu_item_id, COUNT(*) as order_count
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE o.customer_id = $1
         GROUP BY oi.menu_item_id`,
        [customerId]
      );

      const orderedItemIds = customerOrders.rows.map((r) => r.menu_item_id);

      if (orderedItemIds.length === 0) {
        // No order history - recommend popular items
        return this.getPopularRecommendations(customerId, limit);
      }

      // Get similar items (same category, not ordered before)
      const similarItems = await pool.query(
        `SELECT DISTINCT m1.id, m1.category, m1.popularity_score
         FROM menu_items m1
         JOIN menu_items m2 ON m1.category = m2.category
         WHERE m2.id = ANY($1)
         AND m1.id NOT IN (SELECT DISTINCT menu_item_id FROM order_items 
                           JOIN orders ON order_items.order_id = orders.id 
                           WHERE orders.customer_id = $2)
         ORDER BY m1.popularity_score DESC
         LIMIT $3`,
        [orderedItemIds, customerId, limit]
      );

      // Store recommendations
      for (const item of similarItems.rows) {
        await pool.query(
          `INSERT INTO recommendations (customer_id, menu_item_id, reason, score)
           VALUES ($1, $2, 'similar_category', $3)
           ON CONFLICT (customer_id, menu_item_id) 
           DO UPDATE SET score = $3`,
          [customerId, item.id, item.popularity_score]
        );
      }

      return similarItems.rows;
    } catch (err) {
      console.error('Error generating recommendations:', err);
      return [];
    }
  }

  /**
   * Get popular items as recommendations
   */
  static async getPopularRecommendations(customerId, limit = 5) {
    const result = await pool.query(
      `SELECT id, name, popularity_score FROM menu_items 
       WHERE is_available = TRUE
       ORDER BY popularity_score DESC, times_ordered DESC
       LIMIT $1`,
      [limit]
    );

    // Store as recommendations
    for (const item of result.rows) {
      await pool.query(
        `INSERT INTO recommendations (customer_id, menu_item_id, reason, score)
         VALUES ($1, $2, 'popular', $3)
         ON CONFLICT (customer_id, menu_item_id) 
         DO UPDATE SET score = $3`,
        [customerId, item.id, item.popularity_score]
      );
    }

    return result.rows;
  }

  /**
   * Get recommendations for a customer
   */
  static async getRecommendations(customerId, limit = 5) {
    const result = await pool.query(
      `SELECT r.id, r.menu_item_id, m.name, m.description, m.price, m.image_url, r.reason, r.score
       FROM recommendations r
       JOIN menu_items m ON r.menu_item_id = m.id
       WHERE r.customer_id = $1
       ORDER BY r.score DESC
       LIMIT $2`,
      [customerId, limit]
    );

    return result.rows;
  }

  /**
   * Track recommendation conversion
   */
  static async trackConversion(customerId, menuItemId) {
    await pool.query(
      `UPDATE recommendations 
       SET converted = TRUE, shown_count = shown_count + 1
       WHERE customer_id = $1 AND menu_item_id = $2`,
      [customerId, menuItemId]
    );
  }

  /**
   * Track recommendation shown
   */
  static async trackShown(customerId, menuItemId) {
    await pool.query(
      `UPDATE recommendations 
       SET shown_count = shown_count + 1
       WHERE customer_id = $1 AND menu_item_id = $2`,
      [customerId, menuItemId]
    );
  }

  /**
   * Get recommendation conversion rate
   */
  static async getConversionRate(limit = 30) {
    const result = await pool.query(
      `SELECT 
         menu_item_id,
         SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
         SUM(shown_count) as total_shown,
         ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / NULLIF(SUM(shown_count), 0), 2) as conversion_rate
       FROM recommendations
       GROUP BY menu_item_id
       ORDER BY conversion_rate DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}
