/**
 * Kitchen Display System
 * Real-time order management with Socket.io
 */

import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import { joinKitchen, getSocket, onNewOrder } from '../services/socket';

export const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKitchenQueue();
    joinKitchen();

    // Listen for new orders
    onNewOrder((orderData) => {
      setOrders((prev) => [orderData, ...prev]);
    });

    const interval = setInterval(fetchKitchenQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenQueue = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getKitchenQueue();
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching kitchen queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'border-red-600 bg-red-900 bg-opacity-20',
      preparing: 'border-yellow-600 bg-yellow-900 bg-opacity-20',
      ready: 'border-green-600 bg-green-900 bg-opacity-20',
    };
    return colors[status] || 'border-gray-600';
  };

  const filteredOrders =
    filter === 'all'
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-luxury-dark pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-luxury-gold mb-8 font-serif">
          👨‍🍳 Kitchen Display System
        </h1>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          {['all', 'pending', 'preparing', 'ready'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded font-bold ${
                filter === status
                  ? 'bg-luxury-gold text-luxury-dark'
                  : 'bg-gray-900 text-luxury-light border border-luxury-gold'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} (
              {filteredOrders.length})
            </button>
          ))}
        </div>

        {/* Kitchen Queue */}
        <div className="kitchen-display">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-4xl mb-4">✨</p>
              <p className="text-xl text-gray-400">No orders to prepare</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`order-ticket border-4 ${getStatusColor(
                  order.status
                )} animate-slide-in`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-2xl font-bold text-luxury-gold">
                      #{order.order_number.split('-')[1]}
                    </p>
                    <p className="text-xs text-gray-400">
                      Table {order.table_id ? order.table_id.slice(0, 3) : 'N/A'}
                    </p>
                  </div>
                  <span className={`order-status-badge ${`status-${order.status}`}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Items */}
                <div className="bg-black bg-opacity-50 rounded p-3 mb-3">
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2">
                      {order.items
                        .filter((item) => item.menu_item_name)
                        .map((item, idx) => (
                          <div key={idx} className="text-sm">
                            <p className="text-luxury-light font-bold">
                              ×{item.quantity} {item.menu_item_name}
                            </p>
                            {item.special_instructions && (
                              <p className="text-yellow-400 text-xs italic">
                                → {item.special_instructions}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Special Notes */}
                {order.special_notes && (
                  <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded p-2 mb-3">
                    <p className="text-xs text-yellow-300">
                      📝 {order.special_notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, 'preparing')
                      }
                      className="btn-secondary text-sm py-2"
                    >
                      Start Cooking
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, 'ready')
                      }
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm col-span-2"
                    >
                      ✓ Order Ready
                    </button>
                  )}
                  {order.status !== 'ready' && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order.id, 'cancelled')
                      }
                      className="btn-danger text-sm py-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Timer */}
                <p className="text-xs text-gray-400 text-center mt-3">
                  ⏱️ {Math.floor(Math.random() * 20) + 5} min prep
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
