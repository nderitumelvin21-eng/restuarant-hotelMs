/**
 * API Routes - Orders
 */

import express from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { validateBody, validateRequired } from '../middleware/validation.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// Get routes
router.get('/active', OrderController.getActiveOrders);
router.get('/:orderId', OrderController.getOrder);

// Kitchen display
router.get('/kitchen/queue', authorize('admin', 'manager', 'waiter'), OrderController.getKitchenQueue);

// Create order
router.post('/', validateBody, validateRequired('tableId', 'items'), authorize('waiter'), OrderController.createOrder);

// Update order
router.patch('/:orderId/status', validateBody, validateRequired('status'), authorize('admin', 'manager', 'waiter'), OrderController.updateOrderStatus);

// Add item to order
router.post('/:orderId/items', validateBody, validateRequired('menuItemId', 'quantity'), authorize('waiter'), OrderController.addItemToOrder);

// Complete order
router.post('/:orderId/complete', validateBody, validateRequired('paymentMethod', 'amount'), authorize('waiter'), OrderController.completeOrder);

export default router;
