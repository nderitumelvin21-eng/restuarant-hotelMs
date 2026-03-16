/**
 * Main App Component
 * Router configuration and global layout
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Navigation } from './components/Navigation';
import { Homepage } from './pages/Homepage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { AdminDashboard } from './pages/AdminDashboard';
import { TableManagement } from './pages/TableManagement';
import { KitchenDisplay } from './pages/KitchenDisplay';
import { initSocket } from './services/socket';
import './styles/global.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/signin" />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { getCurrentUser, token } = useAuthStore();

  useEffect(() => {
    // Initialize socket.io
    initSocket();

    // Get current user if token exists
    if (token) {
      getCurrentUser().catch(() => {
        // Token invalid, user will be redirected by ProtectedRoute
      });
    }
  }, [token]);

  return (
    <Router>
      <Navigation />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <ProtectedRoute requiredRole={['admin', 'manager']}>
              <TableManagement />
            </ProtectedRoute>
          }
        />

        {/* Waiter Routes */}
        <Route
          path="/waiter/tables"
          element={
            <ProtectedRoute requiredRole={['waiter']}>
              <TableManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter/kitchen"
          element={
            <ProtectedRoute requiredRole={['waiter', 'admin', 'manager']}>
              <KitchenDisplay />
            </ProtectedRoute>
          }
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
