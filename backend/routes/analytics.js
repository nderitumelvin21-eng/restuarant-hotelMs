/**
 * API Routes - Analytics
 */

import express from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication and admin role
router.use(authenticateToken, authorize('admin', 'manager'));

router.get('/revenue', AnalyticsController.getRevenue);
router.get('/waiter-revenue', AnalyticsController.getWaiterRevenue);
router.get('/top-dishes', AnalyticsController.getTopDishes);
router.get('/fraud-alerts', AnalyticsController.getFraudAlerts);
router.get('/daily-summary', AnalyticsController.getDailySummary);
router.get('/table-turnover', AnalyticsController.getTableTurnover);
router.get('/customer-insights', AnalyticsController.getCustomerInsights);

export default router;
