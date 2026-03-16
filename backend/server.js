/**
 * Server Entry Point
 * Express.js Server with Socket.io for real-time updates
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/schema.js';
import { errorHandler } from './utils/errors.js';

// Routes
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import tableRoutes from './routes/tables.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Join kitchen room for kitchen display
  socket.on('join:kitchen', () => {
    socket.join('kitchen');
    console.log('📺 Kitchen display connected');
  });

  // Join waiter room
  socket.on('join:waiter', (waiterId) => {
    socket.join(`waiter:${waiterId}`);
    console.log(`👨‍💼 Waiter ${waiterId} connected`);
  });

  // Join table room
  socket.on('join:table', (tableId) => {
    socket.join(`table:${tableId}`);
  });

  // Emit order to kitchen
  socket.on('order:new', (orderData) => {
    io.to('kitchen').emit('kitchen:new-order', orderData);
  });

  // Update order status
  socket.on('order:status-update', (orderData) => {
    io.to('kitchen').emit('kitchen:order-update', orderData);
    io.to(`table:${orderData.tableId}`).emit('table:order-update', orderData);
  });

  // Update table status
  socket.on('table:status-change', (tableData) => {
    io.emit('tables:update', tableData);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Initialize database and start server
 */
const startServer = async () => {
  try {
    console.log('🚀 Starting Restaurant Management System...\n');

    // Initialize database
    await initializeDatabase();

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`\n🍽️  Restaurant Management System is ready to serve!\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export { io };
