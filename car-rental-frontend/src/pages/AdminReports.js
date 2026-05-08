import React, { useState, useEffect } from 'react';
import { getAdminBookings, getCars } from '../services/api';

function AdminReports() {
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, carsRes] = await Promise.all([
          getAdminBookings(), // JWT attached automatically
          getCars(),
        ]);
        if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
        if (carsRes.data.success) setCars(carsRes.data.cars);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getFilteredBookings = () => {
    let filtered = bookings.filter((b) => b.status === 'approved');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterType === 'today') {
      filtered = filtered.filter((b) => {
        const d = new Date(b.booking_date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
    } else if (filterType === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      filtered = filtered.filter((b) => new Date(b.booking_date) >= weekAgo);
    } else if (filterType === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      filtered = filtered.filter((b) => new Date(b.booking_date) >= monthAgo);
    } else if (filterType === 'custom' && dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59);
      filtered = filtered.filter((b) => {
        const d = new Date(b.booking_date);
        return d >= start && d <= end;
      });
    }
    return filtered;
  };

  const filteredBookings = getFilteredBookings();
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const totalBookings = filteredBookings.length;

  const getPopularCars = () => {
    const count = {};
    filteredBookings.forEach((b) => {
      count[b.car_name] = (count[b.car_name] || 0) + 1;
    });
    return Object.entries(count)
      .map(([name, c]) => ({ name, count: c }))
      .sort((a, b) => b.count - a.count);
  };

  const getMonthlyRevenue = () => {
    const monthly = {};
    filteredBookings.forEach((b) => {
      const d = new Date(b.booking_date);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      monthly[key] = (monthly[key] || 0) + Number(b.total_price);
    });
    return Object.entries(monthly)
      .map(([month, revenue]) => ({ month, revenue }))
      .reverse();
  };

  const getDateWiseRevenue = () => {
    const daily = {};
    filteredBookings.forEach((b) => {
      const date = new Date(b.booking_date).toLocaleDateString('en-IN');
      daily[date] = (daily[date] || 0) + Number(b.total_price);
    });
    return Object.entries(daily)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const popularCars = getPopularCars();
  const monthlyRevenue = getMonthlyRevenue();
  const dateWiseRevenue = getDateWiseRevenue();

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(price);

  const applyCustomRange = () => {
    if (dateRange.startDate && dateRange.endDate) {
      setFilterType('custom');
    } else {
      alert('Please select both start and end dates');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
          <p className="text-gray-500">View business insights and statistics</p>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📅 Filter by Date</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { key: 'all',   label: 'All Time' },
              { key: 'today', label: 'Today' },
              { key: 'week',  label: 'Last 7 Days' },
              { key: 'month', label: 'Last 30 Days' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterType === key ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
            <button
              onClick={applyCustomRange}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Range
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Revenue',    value: formatPrice(totalRevenue),  gradient: 'from-blue-600 to-blue-500',   sub: `From ${totalBookings} bookings` },
            { label: 'Total Bookings',   value: totalBookings,              gradient: 'from-green-600 to-green-500', sub: 'Approved bookings' },
            { label: 'Active Cars',      value: cars.length,                gradient: 'from-purple-600 to-purple-500', sub: 'In fleet' },
            { label: 'Avg Booking Value', value: totalBookings > 0 ? formatPrice(totalRevenue / totalBookings) : formatPrice(0),
              gradient: 'from-yellow-600 to-yellow-500', sub: 'Per booking' },
          ].map(({ label, value, gradient, sub }) => (
            <div key={label} className={`bg-gradient-to-r ${gradient} rounded-2xl p-6 text-white`}>
              <p className="text-sm opacity-90">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs opacity-75 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Popular Cars + Monthly Revenue */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🚗 Most Popular Cars</h2>
            {popularCars.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {popularCars.map((car, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-800">{car.name}</span>
                        <span className="text-gray-600">{car.count} booking(s)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(car.count / popularCars[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Monthly Revenue</h2>
            {monthlyRevenue.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data available</p>
            ) : (
              <div className="space-y-3">
                {monthlyRevenue.slice(0, 6).map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-600">{item.month}</span>
                      <span className="font-semibold text-blue-600">{formatPrice(item.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min((item.revenue / monthlyRevenue[0].revenue) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date-wise Revenue Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Date-wise Revenue</h2>
          {dateWiseRevenue.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No revenue data for selected period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Revenue</th>
                    <th className="p-3 text-left">Bookings</th>
                    <th className="p-3 text-left">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {dateWiseRevenue.map((item, i) => {
                    const dayBookings = filteredBookings.filter(
                      (b) => new Date(b.booking_date).toLocaleDateString('en-IN') === item.date
                    ).length;
                    const maxRevenue = Math.max(...dateWiseRevenue.map((d) => d.revenue));
                    return (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.date}</td>
                        <td className="p-3 text-green-600 font-semibold">{formatPrice(item.revenue)}</td>
                        <td className="p-3 text-gray-600">{dayBookings} booking(s)</td>
                        <td className="p-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4">📈 Summary</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Period</p>
              <p className="font-semibold">
                {filterType === 'today'  && 'Today'}
                {filterType === 'week'   && 'Last 7 Days'}
                {filterType === 'month'  && 'Last 30 Days'}
                {filterType === 'custom' && `${dateRange.startDate} to ${dateRange.endDate}`}
                {filterType === 'all'    && 'All Time'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unique Customers</p>
              <p className="font-semibold">{new Set(filteredBookings.map((b) => b.user_email)).size}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Approval Rate</p>
              <p className="font-semibold">
                {bookings.length > 0
                  ? Math.round((filteredBookings.length / bookings.filter(b => b.status !== 'cancelled').length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;