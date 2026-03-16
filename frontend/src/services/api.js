/**
 * API Service - Handles all backend communication
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => apiClient.post('/auth/signup', data),
  signin: (data) => apiClient.post('/auth/signin', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
  setup2FA: () => apiClient.post('/auth/2fa/setup'),
  enable2FA: (data) => apiClient.post('/auth/2fa/enable', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
};

export const ordersAPI = {
  createOrder: (data) => apiClient.post('/orders', data),
  getOrder: (orderId) => apiClient.get(`/orders/${orderId}`),
  getActiveOrders: () => apiClient.get('/orders/active'),
  updateOrderStatus: (orderId, status) =>
    apiClient.patch(`/orders/${orderId}/status`, { status }),
  getKitchenQueue: () => apiClient.get('/orders/kitchen/queue'),
  addItemToOrder: (orderId, data) =>
    apiClient.post(`/orders/${orderId}/items`, data),
  completeOrder: (orderId, data) =>
    apiClient.post(`/orders/${orderId}/complete`, data),
};

export const tablesAPI = {
  getAllTables: () => apiClient.get('/tables'),
  getTable: (tableId) => apiClient.get(`/tables/${tableId}`),
  createTable: (data) => apiClient.post('/tables', data),
  updateTablePosition: (tableId, data) =>
    apiClient.patch(`/tables/${tableId}/position`, data),
  getStatusSummary: () => apiClient.get('/tables/status/summary'),
  getAvailable: (guestCount) =>
    apiClient.get(`/tables/available?guestCount=${guestCount}`),
  deleteTable: (tableId) => apiClient.delete(`/tables/${tableId}`),
};

export const analyticsAPI = {
  getRevenue: (startDate, endDate) =>
    apiClient.get(`/analytics/revenue?startDate=${startDate}&endDate=${endDate}`),
  getWaiterRevenue: (startDate, endDate) =>
    apiClient.get(
      `/analytics/waiter-revenue?startDate=${startDate}&endDate=${endDate}`
    ),
  getTopDishes: (startDate, endDate, limit = 10) =>
    apiClient.get(
      `/analytics/top-dishes?startDate=${startDate}&endDate=${endDate}&limit=${limit}`
    ),
  getFraudAlerts: () => apiClient.get('/analytics/fraud-alerts'),
  getDailySummary: (date) =>
    apiClient.get(`/analytics/daily-summary?date=${date}`),
  getTableTurnover: () => apiClient.get('/analytics/table-turnover'),
  getCustomerInsights: () => apiClient.get('/analytics/customer-insights'),
};

export default apiClient;
