/**
 * Table Controller
 * Manages table floor plan and status
 */

import { TableModel } from '../models/TableModel.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class TableController {
  /**
   * Get all tables
   * GET /api/tables
   */
  static async getAllTables(req, res, next) {
    try {
      const tables = await TableModel.getAll();

      res.status(200).json({
        success: true,
        data: tables,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get table by ID
   * GET /api/tables/:tableId
   */
  static async getTable(req, res, next) {
    try {
      const table = await TableModel.findById(req.params.tableId);
      if (!table) {
        throw new NotFoundError('Table not found');
      }

      res.status(200).json({
        success: true,
        data: table,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create new table
   * POST /api/tables
   */
  static async createTable(req, res, next) {
    try {
      const { tableNumber, capacity, floorPositionX, floorPositionY, floorPositionZ } =
        req.body;

      if (!tableNumber || !capacity) {
        throw new ValidationError('Table number and capacity are required');
      }

      // Check if table number already exists
      const existingTable = await TableModel.findByNumber(tableNumber);
      if (existingTable) {
        throw new ValidationError('Table number already exists');
      }

      const table = await TableModel.create({
        table_number: tableNumber,
        capacity,
        floor_position_x: floorPositionX || 0,
        floor_position_y: floorPositionY || 0,
        floor_position_z: floorPositionZ || 0,
      });

      res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: table,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update table position (for floor plan editor)
   * PATCH /api/tables/:tableId/position
   */
  static async updateTablePosition(req, res, next) {
    try {
      const { x, y, z } = req.body;

      const table = await TableModel.updatePosition(req.params.tableId, x, y, z);
      if (!table) {
        throw new NotFoundError('Table not found');
      }

      res.status(200).json({
        success: true,
        message: 'Table position updated',
        data: table,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get table status summary
   * GET /api/tables/status/summary
   */
  static async getStatusSummary(req, res, next) {
    try {
      const summary = await TableModel.getStatusSummary();

      const formatted = {
        free: 0,
        occupied: 0,
        reserved: 0,
        cleaning: 0,
      };

      for (const item of summary) {
        formatted[item.status] = parseInt(item.count);
      }

      res.status(200).json({
        success: true,
        data: formatted,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get available tables for reservation
   * GET /api/tables/available?guestCount=4
   */
  static async getAvailable(req, res, next) {
    try {
      const { guestCount } = req.query;

      if (!guestCount) {
        throw new ValidationError('guestCount query parameter is required');
      }

      const tables = await TableModel.getAvailable(parseInt(guestCount));

      res.status(200).json({
        success: true,
        data: tables,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete table
   * DELETE /api/tables/:tableId
   */
  static async deleteTable(req, res, next) {
    try {
      const table = await TableModel.findById(req.params.tableId);
      if (!table) {
        throw new NotFoundError('Table not found');
      }

      await TableModel.delete(req.params.tableId);

      res.status(200).json({
        success: true,
        message: 'Table deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
