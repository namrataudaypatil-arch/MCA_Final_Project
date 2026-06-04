import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white transition-colors duration-300">Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 transition-colors duration-300">Welcome back, <span className="font-semibold text-blue-700 dark:text-blue-400">{user?.name}</span>!</p>
        <div className="grid md:grid-cols-2 gap-8">
          <Link to="/bookings" className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 p-8 rounded-3xl shadow-xl text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">📅</span>
            </div>
            <h3 className="font-bold text-2xl mb-2 text-gray-800 dark:text-white transition-colors duration-300">My Bookings</h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">View your booking history</p>
          </Link>
          <Link to="/cars" className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 p-8 rounded-3xl shadow-xl text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">🚗</span>
            </div>
            <h3 className="font-bold text-2xl mb-2 text-gray-800 dark:text-white transition-colors duration-300">Browse Cars</h3>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Find your perfect ride</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;