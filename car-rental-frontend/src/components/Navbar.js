import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
            RentWheels
          </Link>

          {/* Desktop Menu - Center */}
          <div className="hidden md:flex space-x-8">
            {user?.role === 'admin' ? (
              <Link to="/" className="hover:text-blue-400 transition">Home</Link>
            ) : (
              <>
                <Link to="/" className="hover:text-blue-400 transition">Home</Link>
                <Link to="/cars" className="hover:text-blue-400 transition">Cars</Link>
                <Link to="/about" className="hover:text-blue-400 transition">About Us</Link>
                <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
              </>
            )}
          </div>

          {/* Auth Buttons - Right Side */}
          <div className="hidden md:flex space-x-4 items-center">
            {user ? (
              <>
                <span className="text-blue-300 text-sm">Welcome, {user.name}!</span>
                {user.role === 'admin' ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 px-4 py-1 rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/dashboard" className="hover:text-blue-400 transition px-3 py-1">Dashboard</Link>
                    <Link to="/bookings" className="hover:text-blue-400 transition px-3 py-1">My Bookings</Link>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 px-4 py-1 rounded-lg hover:bg-red-700 transition"
                    >
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-400 transition">Login</Link>
                <Link to="/register" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {user?.role === 'admin' ? (
              <Link to="/" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Home</Link>
            ) : (
              <>
                <Link to="/" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/cars" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Cars</Link>
                <Link to="/about" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                <Link to="/contact" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              </>
            )}

            {user ? (
              <>
                <div className="text-blue-300 text-sm py-1">Welcome, {user.name}!</div>
                {user.role === 'admin' ? (
                  <button onClick={handleLogout} className="block py-2 hover:text-red-400 w-full text-left">
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/dashboard" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    <Link to="/bookings" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>My Bookings</Link>
                    <button onClick={handleLogout} className="block py-2 hover:text-red-400 w-full text-left">
                      Logout
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block py-2 bg-blue-600 px-4 rounded-lg text-center" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;