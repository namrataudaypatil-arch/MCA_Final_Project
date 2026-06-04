import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCars: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const response = await getAdminStats(); // JWT attached automatically
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Cars',     value: stats.totalCars,                  icon: '🚗', color: 'border-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Users',    value: stats.totalUsers,                  icon: '👥', color: 'border-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Bookings', value: stats.totalBookings,               icon: '📅', color: 'border-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Total Revenue',  value: formatPrice(stats.totalRevenue),   icon: '💰', color: 'border-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  ];

  const menuItems = [
    { to: '/admin/cars',     icon: '🚗', title: 'Manage Cars',    desc: 'Add, edit, or remove cars from fleet',    bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { to: '/admin/users',    icon: '👥', title: 'Manage Users',   desc: 'View all registered users',                bg: 'bg-green-100 dark:bg-green-900/30' },
    { to: '/admin/bookings', icon: '📅', title: 'All Bookings',   desc: 'View and manage all bookings',             bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { to: '/admin/reports',  icon: '📊', title: 'Reports',        desc: 'View revenue and analytics',               bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Manage your car rental business from one place</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {statCards.map((s) => (
            <div key={s.label} className={`backdrop-blur-md bg-white/80 dark:bg-slate-800/80 rounded-3xl shadow-xl p-8 border-l-4 border-t border-b border-r ${s.color} border-t-gray-100 border-b-gray-100 border-r-gray-100 dark:border-t-slate-700 dark:border-b-slate-700 dark:border-r-slate-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300 font-semibold">{s.label}</p>
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300 mt-1">{s.value}</p>
                </div>
                <div className={`w-14 h-14 ${s.bg} rounded-full flex items-center justify-center shadow-inner transition-colors duration-300`}>
                  <span className="text-3xl">{s.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 group"
            >
              <div className={`w-20 h-20 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner transition-colors duration-300 group-hover:scale-110`}>
                <span className="text-4xl">{item.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{item.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300 font-medium">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;