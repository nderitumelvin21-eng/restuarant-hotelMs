/**
 * Analytics Controller
 * Revenue, fraud detection, and performance metrics
 */

import { AnalyticsService } from '../services/AnalyticsService.js';
import { ValidationError } from '../utils/errors.js';

export class AnalyticsController {
  /**
   * Get revenue by date range
   * GET /api/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31
   */
  static async getRevenue(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new ValidationError('startDate and endDate are required');
      }

      const revenue = await AnalyticsService.getRevenueByDateRange(startDate, endDate);

      res.status(200).json({
        success: true,
        data: revenue,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get revenue by waiter
   * GET /api/analytics/waiter-revenue?startDate=2024-01-01&endDate=2024-01-31
   */
  static async getWaiterRevenue(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new ValidationError('startDate and endDate are required');
      }

      const data = await AnalyticsService.getRevenueByWaiter(startDate, endDate);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get top selling dishes
   * GET /api/analytics/top-dishes?limit=10&startDate=2024-01-01&endDate=2024-01-31
   */
  static async getTopDishes(req, res, next) {
    try {
      const { limit = 10, startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new ValidationError('startDate and endDate are required');
      }

      const dishes = await AnalyticsService.getTopSellingDishes(
        parseInt(limit),
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        data: dishes,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get fraud alerts
   * GET /api/analytics/fraud-alerts
   */
  static async getFraudAlerts(req, res, next) {
    try {
      const alerts = await AnalyticsService.detectFraudPatterns();

      res.status(200).json({
        success: true,
        data: alerts,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get daily summary
   * GET /api/analytics/daily-summary?date=2024-01-15
   */
  static async getDailySummary(req, res, next) {
    try {
      const { date } = req.query;
      const summary = await AnalyticsService.getDailySummary(
        date ? new Date(date) : new Date()
      );

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get table turnover
   * GET /api/analytics/table-turnover
   */
  static async getTableTurnover(req, res, next) {
    try {
      const data = await AnalyticsService.getTableTurnover();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get customer insights
   * GET /api/analytics/customer-insights
   */
  static async getCustomerInsights(req, res, next) {
    try {
      const insights = await AnalyticsService.getCustomerInsights();

      res.status(200).json({
        success: true,
        data: insights,
      });
    } catch (err) {
      next(err);
    }
  }
}
