/**
 * Application Constants
 */

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WAITER: 'waiter',
  CUSTOMER: 'customer',
};

export const TABLE_STATUS = {
  FREE: 'free',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE: 'mobile', // M-Pesa, etc.
};

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ARRIVED: 'arrived',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const VIP_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

export const FRAUD_RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};
