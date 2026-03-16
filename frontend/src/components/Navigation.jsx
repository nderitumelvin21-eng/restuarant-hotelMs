/**
 * Navigation Component
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const Navigation = () => {
  const { user, signout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-luxury-gold font-serif">
          🍽️ Restaurant Manager
        </Link>

        <div className="flex gap-6 items-center">
          {user.role === 'customer' && (
            <>
              <Link to="/menu" className="nav-link">
                Menu
              </Link>
              <Link to="/reservations" className="nav-link">
                Reservations
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            </>
          )}

          {user.role === 'waiter' && (
            <>
              <Link to="/waiter/tables" className="nav-link">
                Tables
              </Link>
              <Link to="/waiter/orders" className="nav-link">
                Orders
              </Link>
              <Link to="/waiter/kitchen" className="nav-link">
                Kitchen Display
              </Link>
            </>
          )}

          {(user.role === 'admin' || user.role === 'manager') && (
            <>
              <Link to="/admin/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/admin/orders" className="nav-link">
                Orders
              </Link>
              <Link to="/admin/analytics" className="nav-link">
                Analytics
              </Link>
              <Link to="/admin/settings" className="nav-link">
                Settings
              </Link>
            </>
          )}

          <div className="flex items-center gap-3">
            <span className="text-luxury-light text-sm">
              {user.first_name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="btn-danger px-4 py-2 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
