/**
 * API Routes - Tables
 */

import express from 'express';
import { TableController } from '../controllers/TableController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { validateBody, validateRequired } from '../middleware/validation.js';

const router = express.Router();

// All table routes require authentication
router.use(authenticateToken);

// Get routes
router.get('/status/summary', TableController.getStatusSummary);
router.get('/available', TableController.getAvailable);
router.get('/:tableId', TableController.getTable);
router.get('/', TableController.getAllTables);

// Admin only routes
router.post('/', authorize('admin', 'manager'), validateBody, validateRequired('tableNumber', 'capacity'), TableController.createTable);
router.patch('/:tableId/position', authorize('admin', 'manager'), validateBody, validateRequired('x', 'y'), TableController.updateTablePosition);
router.delete('/:tableId', authorize('admin', 'manager'), TableController.deleteTable);

export default router;
