/**
 * Sign Up Page
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim())
      newErrors.lastName = 'Last name is required';
    if (!formData.email.includes('@'))
      newErrors.email = 'Valid email is required';
    if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup(formData);
      navigate('/');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Sign up failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-luxury-dark flex items-center justify-center px-4 mt-20">
      <div className="card w-full max-w-md">
        <h1 className="text-3xl font-bold text-luxury-gold mb-6 text-center font-serif">
          Create Account
        </h1>

        {errors.submit && (
          <div className="bg-red-900 bg-opacity-50 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-luxury-light mb-2 text-sm">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none"
                placeholder="Ahmed"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-luxury-light mb-2 text-sm">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none"
                placeholder="Al-Maktoum"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-luxury-light mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-luxury-light mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none"
              placeholder="+971501234567"
            />
          </div>

          <div>
            <label className="block text-luxury-light mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-luxury-light mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-luxury-gold rounded text-luxury-light focus:outline-none"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/signin" className="text-luxury-gold hover:text-yellow-300">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
