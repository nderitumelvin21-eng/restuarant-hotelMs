/**
 * Table Management Page
 * Visual floor plan with drag-and-drop
 */

import React, { useState, useEffect } from 'react';
import { tablesAPI } from '../services/api';

export const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    fetchTables();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await tablesAPI.getAllTables();
      setTables(response.data.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      free: 'bg-green-900',
      occupied: 'bg-red-900',
      reserved: 'bg-blue-900',
      cleaning: 'bg-yellow-900',
    };
    return colors[status] || 'bg-gray-900';
  };

  const getStatusLabel = (status) => {
    const labels = {
      free: '🟢 Free',
      occupied: '🔴 Occupied',
      reserved: '🔵 Reserved',
      cleaning: '🟡 Cleaning',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-luxury-dark pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-luxury-gold mb-8 font-serif">
          🪑 Table Management
        </h1>

        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { status: 'free', label: 'Free', icon: '🟢' },
            { status: 'occupied', label: 'Occupied', icon: '🔴' },
            { status: 'reserved', label: 'Reserved', icon: '🔵' },
            { status: 'cleaning', label: 'Cleaning', icon: '🟡' },
          ].map((item) => {
            const count = tables.filter((t) => t.status === item.status).length;
            return (
              <div key={item.status} className="card text-center">
                <p className="text-3xl mb-2">{item.icon}</p>
                <p className="text-luxury-gold font-bold text-lg">{count}</p>
                <p className="text-gray-400 text-sm">{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Floor Plan Grid */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-luxury-gold mb-6">
            📍 Restaurant Floor Plan
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`${getStatusColor(
                  table.status
                )} p-4 rounded-lg cursor-pointer hover:shadow-lg transition-all border-2 border-luxury-gold transform hover:scale-105`}
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-luxury-gold">
                    {table.table_number}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {table.capacity} seats
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {table.current_occupancy > 0 ? (
                      <>{table.current_occupancy} guests</>
                    ) : (
                      <>Empty</>
                    )}
                  </p>
                  <p className="text-xs text-luxury-gold font-bold mt-2">
                    {getStatusLabel(table.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Details */}
        {selectedTable && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-luxury-gold">
                Table #{selectedTable.table_number} Details
              </h3>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-gray-400 hover:text-luxury-gold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Capacity</p>
                <p className="text-xl font-bold text-luxury-gold">
                  {selectedTable.capacity} seats
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Occupancy</p>
                <p className="text-xl font-bold text-luxury-gold">
                  {selectedTable.current_occupancy} guests
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-xl font-bold text-luxury-gold">
                  {getStatusLabel(selectedTable.status)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Occupied Since</p>
                <p className="text-xl font-bold text-luxury-gold">
                  {selectedTable.occupied_since
                    ? new Date(selectedTable.occupied_since).toLocaleTimeString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1">View Order</button>
              <button className="btn-secondary flex-1">Add Order</button>
              <button className="btn-primary flex-1">Mark as Cleaning</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
