/**
 * Sign In Page
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  const [requiresTwoFA, setRequiresTwoFA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signin } = useAuthStore();
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signin(email, password, twoFAToken);
      if (result.requiresTwoFA) {
        setRequiresTwoFA(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-dark flex items-center justify-center px-4 mt-20">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-luxury-gold mb-6 text-center font-serif">
          Welcome Back
        </h1>

        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-luxury-light mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none focus:border-yellow-400"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-luxury-light mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none focus:border-yellow-400"
              placeholder="••••••••"
              required
            />
          </div>

          {requiresTwoFA && (
            <div>
              <label className="block text-luxury-light mb-2">
                2FA Token (6 digits)
              </label>
              <input
                type="text"
                value={twoFAToken}
                onChange={(e) => setTwoFAToken(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none focus:border-yellow-400"
                placeholder="000000"
                maxLength="6"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Signing in...' : requiresTwoFA ? 'Verify' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-luxury-gold hover:text-yellow-300">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-900 bg-opacity-50 rounded border border-luxury-gold">
          <p className="text-luxury-gold text-sm font-bold mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-300 mb-1">
            Admin: admin@restaurant.com / Admin123!@#
          </p>
          <p className="text-xs text-gray-300 mb-1">
            Waiter: waiter1@restaurant.com / Waiter123!@#
          </p>
          <p className="text-xs text-gray-300">
            Customer: customer1@email.com / Customer123!@#
          </p>
        </div>
      </div>
    </div>
  );
};
