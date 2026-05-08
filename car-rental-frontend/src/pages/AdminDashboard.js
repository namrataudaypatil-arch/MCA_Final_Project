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
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Cars',     value: stats.totalCars,                  icon: '🚗', color: 'border-blue-600',   bg: 'bg-blue-100' },
    { label: 'Total Users',    value: stats.totalUsers,                  icon: '👥', color: 'border-green-600',  bg: 'bg-green-100' },
    { label: 'Total Bookings', value: stats.totalBookings,               icon: '📅', color: 'border-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Revenue',  value: formatPrice(stats.totalRevenue),   icon: '💰', color: 'border-yellow-600', bg: 'bg-yellow-100' },
  ];

  const menuItems = [
    { to: '/admin/cars',     icon: '🚗', title: 'Manage Cars',    desc: 'Add, edit, or remove cars from fleet',    bg: 'bg-blue-100' },
    { to: '/admin/users',    icon: '👥', title: 'Manage Users',   desc: 'View all registered users',                bg: 'bg-green-100' },
    { to: '/admin/bookings', icon: '📅', title: 'All Bookings',   desc: 'View and manage all bookings',             bg: 'bg-purple-100' },
    { to: '/admin/reports',  icon: '📊', title: 'Reports',        desc: 'View revenue and analytics',               bg: 'bg-yellow-100' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your car rental business from one place</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 ${s.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{s.value}</p>
                </div>
                <div className={`w-12 h-12 ${s.bg} rounded-full flex items-center justify-center`}>
                  <span className="text-2xl">{s.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2"
            >
              <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-3xl">{item.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;