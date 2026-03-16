/**
 * Socket.io Service - Real-time updates
 */

import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

// Kitchen Display Events
export const joinKitchen = () => {
  getSocket().emit('join:kitchen');
};

export const onNewOrder = (callback) => {
  getSocket().on('kitchen:new-order', callback);
};

export const onOrderUpdate = (callback) => {
  getSocket().on('kitchen:order-update', callback);
};

// Table Status Events
export const joinTable = (tableId) => {
  getSocket().emit('join:table', tableId);
};

export const onTableUpdate = (callback) => {
  getSocket().on('table:order-update', callback);
};

// Emit Events
export const emitNewOrder = (orderData) => {
  getSocket().emit('order:new', orderData);
};

export const emitOrderStatusUpdate = (orderData) => {
  getSocket().emit('order:status-update', orderData);
};

export const emitTableStatusChange = (tableData) => {
  getSocket().emit('table:status-change', tableData);
};

// Cleanup
export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
