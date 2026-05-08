import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.name}!</p>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/bookings" className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-bold text-lg">My Bookings</h3>
            <p className="text-gray-600">View your booking history</p>
          </Link>
          <Link to="/cars" className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
            <div className="text-4xl mb-3">🚗</div>
            <h3 className="font-bold text-lg">Browse Cars</h3>
            <p className="text-gray-600">Find your perfect ride</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;