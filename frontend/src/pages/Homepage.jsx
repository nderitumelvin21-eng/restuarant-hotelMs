/**
 * Homepage Component
 * Luxury restaurant landing page
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const Homepage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Featured dishes
  const featuredDishes = [
    {
      name: 'Wagyu Ribeye',
      price: '$185',
      image: '🥩',
      desc: 'Prime Japanese Wagyu with truffle mashed potato',
    },
    {
      name: 'Grilled Hammour',
      price: '$145',
      image: '🐟',
      desc: 'Fresh Gulf hammour with seasonal vegetables',
    },
    {
      name: 'Lamb Kabab',
      price: '$125',
      image: '🍖',
      desc: 'Chargrilled lamb skewers with chimichurri',
    },
    {
      name: 'Chocolate Lava Cake',
      price: '$50',
      image: '🍰',
      desc: 'Warm chocolate cake with molten center',
    },
  ];

  // Reviews
  const reviews = [
    {
      name: 'Ahmed Al-Maktoum',
      text: 'An absolutely exquisite dining experience. Every dish was perfection!',
      rating: 5,
    },
    {
      name: 'Fatima Al-Nahyan',
      text: 'The service was impeccable and the ambiance truly luxurious.',
      rating: 5,
    },
    {
      name: 'Hassan Al-Suwaidi',
      text: 'Best restaurant in Dubai. Will definitely come back!',
      rating: 5,
    },
  ];

  if (user) {
    // Redirect based on role
    if (user.role === 'customer') navigate('/menu');
    if (user.role === 'waiter') navigate('/waiter/tables');
    if (user.role === 'admin' || user.role === 'manager')
      navigate('/admin/dashboard');
  }

  return (
    <div className="min-h-screen bg-luxury-dark text-luxury-light">
      {/* Hero Section */}
      <section className="hero mt-20">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Fine Dining Paradise</h1>
          <p className="text-2xl text-luxury-gold mb-8">
            Experience luxury dining like never before
          </p>
          <div className="flex gap-4 justify-center">
            {!user ? (
              <>
                <Link to="/signin" className="btn-primary">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-secondary">
                  Create Account
                </Link>
              </>
            ) : (
              <Link to="/menu" className="btn-primary">
                Explore Menu
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-luxury-gold mb-12 font-serif">
            Featured Dishes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDishes.map((dish, idx) => (
              <div key={idx} className="card hover:scale-105 transition-transform">
                <div className="text-6xl text-center mb-4">{dish.image}</div>
                <h3 className="text-xl font-bold text-luxury-gold mb-2">
                  {dish.name}
                </h3>
                <p className="text-sm text-gray-300 mb-4">{dish.desc}</p>
                <p className="text-2xl font-bold text-luxury-gold">{dish.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 bg-black bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-luxury-gold mb-12 font-serif">
            Guest Reviews
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <div key={idx} className="card">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-luxury-gold text-lg">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">{review.text}</p>
                <p className="text-luxury-gold font-bold">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-luxury-gold mb-6 font-serif">
          Ready for an Unforgettable Experience?
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Book your table now and discover culinary excellence
        </p>
        {!user ? (
          <Link to="/signup" className="btn-primary inline-block">
            Book a Table
          </Link>
        ) : (
          <Link to="/reservations" className="btn-primary inline-block">
            Make Reservation
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-luxury-gold py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-luxury-gold font-bold mb-4">Contact</h3>
            <p className="text-gray-400">+971 4 XXX XXXX</p>
            <p className="text-gray-400">info@restaurant.ae</p>
          </div>
          <div>
            <h3 className="text-luxury-gold font-bold mb-4">Hours</h3>
            <p className="text-gray-400">Lunch: 12 PM - 3 PM</p>
            <p className="text-gray-400">Dinner: 6 PM - 11 PM</p>
          </div>
          <div>
            <h3 className="text-luxury-gold font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-luxury-gold hover:text-yellow-300">
                Facebook
              </a>
              <a href="#" className="text-luxury-gold hover:text-yellow-300">
                Instagram
              </a>
              <a href="#" className="text-luxury-gold hover:text-yellow-300">
                Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8 pt-4 border-t border-gray-700">
          <p>&copy; 2024 Fine Dining Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
