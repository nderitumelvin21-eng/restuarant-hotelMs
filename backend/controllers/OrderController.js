/**
 * Order Controller
 * Handles order creation, management, and kitchen display
 */

import { OrderModel } from '../models/OrderModel.js';
import { MenuItemModel } from '../models/MenuItemModel.js';
import { TableModel } from '../models/TableModel.js';
import { PaymentModel } from '../models/PaymentModel.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';

export class OrderController {
  /**
   * Create new order
   * POST /api/orders
   */
  static async createOrder(req, res, next) {
    try {
      const { tableId, customerId, items, specialNotes } = req.body;

      // Validate table exists and is available
      const table = await TableModel.findById(tableId);
      if (!table) {
        throw new NotFoundError('Table not found');
      }

      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        const menuItem = await MenuItemModel.findById(item.menuItemId);
        if (!menuItem) {
          throw new NotFoundError(`Menu item ${item.menuItemId} not found`);
        }
        totalAmount += menuItem.price * item.quantity;
      }

      // Create order
      const orderNumber = `ORD-${Date.now()}`;
      const order = await OrderModel.create({
        order_number: orderNumber,
        table_id: tableId,
        customer_id: customerId,
        waiter_id: req.user.id,
        total_amount: totalAmount,
        special_notes: specialNotes,
      });

      // Add items to order
      for (const item of items) {
        const menuItem = await MenuItemModel.findById(item.menuItemId);
        await OrderModel.addItem(
          order.id,
          item.menuItemId,
          item.quantity,
          menuItem.price,
          item.specialInstructions
        );

        // Increment times ordered
        await MenuItemModel.incrementTimesOrdered(item.menuItemId);
      }

      // Mark table as occupied
      await TableModel.markOccupied(tableId, items.length);

      // Get full order details
      const orderDetails = await OrderModel.getWithItems(order.id);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: orderDetails,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:orderId
   */
  static async getOrder(req, res, next) {
    try {
      const order = await OrderModel.getWithItems(req.params.orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get active orders
   * GET /api/orders/active
   */
  static async getActiveOrders(req, res, next) {
    try {
      const orders = await OrderModel.getActiveOrders();

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update order status
   * PATCH /api/orders/:orderId/status
   */
  static async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;

      if (
        ![
          'pending',
          'confirmed',
          'preparing',
          'ready',
          'served',
          'completed',
          'cancelled',
        ].includes(status)
      ) {
        throw new ValidationError('Invalid status');
      }

      const order = await OrderModel.updateStatus(req.params.orderId, status);

      res.status(200).json({
        success: true,
        message: 'Order status updated',
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get kitchen queue (orders to prepare)
   * GET /api/kitchen/queue
   */
  static async getKitchenQueue(req, res, next) {
    try {
      const queue = await OrderModel.getKitchenQueue();

      res.status(200).json({
        success: true,
        data: queue,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add item to order
   * POST /api/orders/:orderId/items
   */
  static async addItemToOrder(req, res, next) {
    try {
      const { menuItemId, quantity, specialInstructions } = req.body;

      const menuItem = await MenuItemModel.findById(menuItemId);
      if (!menuItem) {
        throw new NotFoundError('Menu item not found');
      }

      const item = await OrderModel.addItem(
        req.params.orderId,
        menuItemId,
        quantity,
        menuItem.price,
        specialInstructions
      );

      // Update order total
      const order = await OrderModel.findById(req.params.orderId);
      const newTotal = order.total_amount + menuItem.price * quantity;
      await OrderModel.updateTotal(req.params.orderId, newTotal);

      res.status(201).json({
        success: true,
        message: 'Item added to order',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Complete order and collect payment
   * POST /api/orders/:orderId/complete
   */
  static async completeOrder(req, res, next) {
    try {
      const { paymentMethod, amount } = req.body;

      const order = await OrderModel.findById(req.params.orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Create payment
      const fraudData = {
        amount,
        method: paymentMethod,
        customer_transaction_count: 1,
        customer_daily_total: amount,
      };

      const fraud = AnalyticsService.calculateFraudRisk(fraudData);

      const payment = await PaymentModel.create({
        order_id: order.id,
        amount,
        method: paymentMethod,
        fraud_score: fraud.score,
        fraud_risk_level: fraud.riskLevel,
      });

      // Update payment status
      await PaymentModel.updateStatus(payment.id, 'completed');

      // Update order status
      await OrderModel.updateStatus(order.id, 'completed');

      // Mark table as free
      if (order.table_id) {
        await TableModel.markFree(order.table_id);
      }

      res.status(200).json({
        success: true,
        message: 'Order completed',
        data: {
          order: order,
          payment: payment,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
