/**
 * Order Store - Zustand store for order state
 */

import create from 'zustand';
import { ordersAPI } from '../services/api';

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  kitchenQueue: [],
  loading: false,
  error: null,

  // Get active orders
  getActiveOrders: async () => {
    set({ loading: true });
    try {
      const response = await ordersAPI.getActiveOrders();
      set({ orders: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Create order
  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const response = await ordersAPI.createOrder(orderData);
      set((state) => ({
        orders: [...state.orders, response.data.data],
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get order by ID
  getOrder: async (orderId) => {
    try {
      const response = await ordersAPI.getOrder(orderId);
      set({ currentOrder: response.data.data });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, status);
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? response.data.data : o
        ),
      }));
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get kitchen queue
  getKitchenQueue: async () => {
    try {
      const response = await ordersAPI.getKitchenQueue();
      set({ kitchenQueue: response.data.data });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Add item to order
  addItemToOrder: async (orderId, itemData) => {
    try {
      const response = await ordersAPI.addItemToOrder(orderId, itemData);
      const updated = await get().getOrder(orderId);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete order
  completeOrder: async (orderId, paymentData) => {
    try {
      const response = await ordersAPI.completeOrder(orderId, paymentData);
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== orderId),
      }));
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Clear orders
  clearOrders: () => {
    set({ orders: [], currentOrder: null, kitchenQueue: [] });
  },
}));
