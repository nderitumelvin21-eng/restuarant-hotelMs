/**
 * Menu Item Model
 */

import pool from '../config/database.js';

export class MenuItemModel {
  /**
   * Create a new menu item
   */
  static async create(itemData) {
    const {
      name,
      description,
      category,
      price,
      cost,
      image_url,
      preparation_time_minutes,
      allergens,
    } = itemData;

    const result = await pool.query(
      `INSERT INTO menu_items 
       (name, description, category, price, cost, image_url, preparation_time_minutes, allergens)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        name,
        description,
        category,
        price,
        cost,
        image_url,
        preparation_time_minutes,
        allergens || [],
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Get all menu items
   */
  static async getAll() {
    const result = await pool.query(
      `SELECT * FROM menu_items WHERE is_available = TRUE ORDER BY category, name`
    );
    return result.rows;
  }

  /**
   * Get menu items by category
   */
  static async getByCategory(category) {
    const result = await pool.query(
      `SELECT * FROM menu_items 
       WHERE category = $1 AND is_available = TRUE 
       ORDER BY popularity_score DESC`,
      [category]
    );
    return result.rows;
  }

  /**
   * Get menu item by ID
   */
  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM menu_items WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Get popular items
   */
  static async getPopular(limit = 10) {
    const result = await pool.query(
      `SELECT * FROM menu_items 
       WHERE is_available = TRUE 
       ORDER BY popularity_score DESC, times_ordered DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  /**
   * Update menu item
   */
  static async update(itemId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(itemId);

    const query = `UPDATE menu_items SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Increment times ordered
   */
  static async incrementTimesOrdered(itemId) {
    const result = await pool.query(
      `UPDATE menu_items 
       SET times_ordered = times_ordered + 1,
           popularity_score = popularity_score + 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [itemId]
    );
    return result.rows[0] || null;
  }

  /**
   * Update popularity score
   */
  static async updatePopularityScore(itemId, score) {
    const result = await pool.query(
      `UPDATE menu_items 
       SET popularity_score = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [itemId, score]
    );
    return result.rows[0] || null;
  }

  /**
   * Toggle availability
   */
  static async toggleAvailability(itemId) {
    const result = await pool.query(
      `UPDATE menu_items 
       SET is_available = NOT is_available,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [itemId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get all categories
   */
  static async getCategories() {
    const result = await pool.query(
      `SELECT DISTINCT category FROM menu_items ORDER BY category`
    );
    return result.rows.map((r) => r.category);
  }

  /**
   * Delete menu item
   */
  static async delete(itemId) {
    await pool.query(`DELETE FROM menu_items WHERE id = $1`, [itemId]);
  }
}
