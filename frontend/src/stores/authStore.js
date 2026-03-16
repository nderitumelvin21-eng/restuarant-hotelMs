/**
 * Auth Store - Zustand store for authentication state
 */

import create from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: false,
  error: null,

  // Sign up
  signup: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.signup(userData);
      const { token, user } = response.data.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Sign up failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Sign in
  signin: async (email, password, twoFAToken) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.signin({ email, password, twoFAToken });
      const { token, user } = response.data.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, loading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Sign in failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  // Sign out
  signout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await authAPI.getCurrentUser();
      set({ user: response.data.data });
      return response.data;
    } catch (error) {
      console.error('Failed to get user:', error);
    }
  },

  // Setup 2FA
  setup2FA: async () => {
    try {
      const response = await authAPI.setup2FA();
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Enable 2FA
  enable2FA: async (secret, verificationToken) => {
    try {
      const response = await authAPI.enable2FA({
        secret,
        verificationToken,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}));
