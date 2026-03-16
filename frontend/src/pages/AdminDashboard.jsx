/**
 * Admin Dashboard Page
 * Real-time revenue, orders, and system metrics
 */

import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

export const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    occupied_tables: 0,
    reservations_today: 0,
    revenue: 0,
    completed_orders: 0,
    cancelled_orders: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDailySummary();
    const interval = setInterval(fetchDailySummary, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDailySummary = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await analyticsAPI.getDailySummary(today);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, trend }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-luxury-gold">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-2 ${
                trend.positive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-luxury-dark pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-luxury-gold mb-8 font-serif">
          📊 Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Occupied Tables"
            value={summary.occupied_tables || 0}
            icon="🪑"
            trend={{ positive: true, value: 12 }}
          />
          <StatCard
            title="Today Revenue"
            value={`$${(summary.revenue || 0).toLocaleString()}`}
            icon="💰"
            trend={{ positive: true, value: 8 }}
          />
          <StatCard
            title="Reservations"
            value={summary.reservations_today || 0}
            icon="📅"
            trend={{ positive: false, value: 5 }}
          />
          <StatCard
            title="Completed Orders"
            value={summary.completed_orders || 0}
            icon="✅"
            trend={{ positive: true, value: 15 }}
          />
          <StatCard
            title="Cancelled Orders"
            value={summary.cancelled_orders || 0}
            icon="❌"
            trend={{ positive: false, value: 2 }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <h3 className="text-luxury-gold font-bold mb-4">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <button className="btn-secondary w-full text-sm">
                View All Orders
              </button>
              <button className="btn-secondary w-full text-sm">
                Manage Tables
              </button>
              <button className="btn-secondary w-full text-sm">
                View Analytics
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-luxury-gold font-bold mb-4">🚨 Alerts</h3>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-400">
                ⚠️ 2 pending reservations
              </p>
              <p className="text-red-400">
                🔴 1 high fraud transaction
              </p>
              <p className="text-blue-400">
                ℹ️ Kitchen queue: 5 orders
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-luxury-gold font-bold mb-4">👥 Top Performers</h3>
            <div className="space-y-2 text-sm">
              <p className="text-luxury-gold">Waiter 1: $450 revenue</p>
              <p className="text-luxury-gold">Waiter 2: $380 revenue</p>
              <p className="text-luxury-gold">Waiter 3: $320 revenue</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-luxury-gold font-bold mb-4">📈 Revenue Trend</h3>
            <div className="h-40 flex items-center justify-center text-gray-500">
              [Revenue Chart]
            </div>
          </div>

          <div className="card">
            <h3 className="text-luxury-gold font-bold mb-4">🍽️ Popular Dishes</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Wagyu Ribeye</span>
                <span className="text-luxury-gold font-bold">45 orders</span>
              </div>
              <div className="h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-luxury-gold"
                  style={{ width: '90%' }}
                ></div>
              </div>
              <div className="flex justify-between mt-4">
                <span>Grilled Hammour</span>
                <span className="text-luxury-gold font-bold">38 orders</span>
              </div>
              <div className="h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-full bg-luxury-gold"
                  style={{ width: '76%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
