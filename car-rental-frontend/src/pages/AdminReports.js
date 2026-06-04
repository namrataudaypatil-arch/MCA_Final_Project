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
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">View business insights and statistics</p>
        </div>

        {/* Date Filter */}
        <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-8 mb-10 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300">
            <span>📅</span> Filter by Date
          </h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { key: 'all',   label: 'All Time' },
              { key: 'today', label: 'Today' },
              { key: 'week',  label: 'Last 7 Days' },
              { key: 'month', label: 'Last 30 Days' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  filterType === key ? 'bg-blue-900 text-white dark:bg-blue-600 shadow-md transform hover:-translate-y-0.5' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 items-end bg-gray-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-gray-200 dark:border-slate-700 transition-colors duration-300">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 shadow-sm"
              />
            </div>
            <button
              onClick={applyCustomRange}
              className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md transition transform hover:-translate-y-0.5 h-[50px]"
            >
              Apply Range
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Revenue',    value: formatPrice(totalRevenue),  gradient: 'from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700',   sub: `From ${totalBookings} bookings` },
            { label: 'Total Bookings',   value: totalBookings,              gradient: 'from-green-500 to-green-700 dark:from-green-500 dark:to-green-700', sub: 'Approved bookings' },
            { label: 'Active Cars',      value: cars.length,                gradient: 'from-purple-500 to-purple-700 dark:from-purple-500 dark:to-purple-700', sub: 'In fleet' },
            { label: 'Avg Booking Value', value: totalBookings > 0 ? formatPrice(totalRevenue / totalBookings) : formatPrice(0),
              gradient: 'from-yellow-500 to-yellow-700 dark:from-yellow-500 dark:to-yellow-700', sub: 'Per booking' },
          ].map(({ label, value, gradient, sub }) => (
            <div key={label} className={`bg-gradient-to-br ${gradient} rounded-3xl p-8 text-white shadow-xl transform hover:-translate-y-1 transition duration-300 relative overflow-hidden group`}>
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-sm font-semibold opacity-90 uppercase tracking-wider mb-2">{label}</p>
              <p className="text-4xl font-extrabold mb-1 drop-shadow-md">{value}</p>
              <p className="text-sm opacity-80 font-medium">{sub}</p>
            </div>
          ))}
        </div>

        {/* Popular Cars + Monthly Revenue */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-8 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300"><span>🚗</span> Most Popular Cars</h2>
            {popularCars.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8 transition-colors duration-300">No bookings yet</p>
            ) : (
              <div className="space-y-5">
                {popularCars.map((car, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center font-bold text-blue-700 dark:text-blue-400 shadow-inner transition-colors duration-300">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{car.name}</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">{car.count} booking(s)</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 shadow-inner transition-colors duration-300">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(car.count / popularCars[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-8 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors duration-300"><span>📊</span> Monthly Revenue</h2>
            {monthlyRevenue.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8 transition-colors duration-300">No data available</p>
            ) : (
              <div className="space-y-4">
                {monthlyRevenue.slice(0, 6).map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">{item.month}</span>
                      <span className="font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{formatPrice(item.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 shadow-inner transition-colors duration-300">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full"
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
        <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden mb-10 transition-colors duration-300">
          <div className="p-8 border-b border-gray-100 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300"><span>📋</span> Date-wise Revenue</h2>
          </div>
          {dateWiseRevenue.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10 transition-colors duration-300">No revenue data for selected period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
                  <tr>
                    <th className="p-5 text-left font-bold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="p-5 text-left font-bold text-gray-700 dark:text-gray-300">Revenue</th>
                    <th className="p-5 text-left font-bold text-gray-700 dark:text-gray-300">Bookings</th>
                    <th className="p-5 text-left font-bold text-gray-700 dark:text-gray-300">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 transition-colors duration-300">
                  {dateWiseRevenue.map((item, i) => {
                    const dayBookings = filteredBookings.filter(
                      (b) => new Date(b.booking_date).toLocaleDateString('en-IN') === item.date
                    ).length;
                    const maxRevenue = Math.max(...dateWiseRevenue.map((d) => d.revenue));
                    return (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-300">
                        <td className="p-5 font-bold text-gray-900 dark:text-white transition-colors duration-300">{item.date}</td>
                        <td className="p-5 font-extrabold text-green-600 dark:text-green-400 transition-colors duration-300">{formatPrice(item.revenue)}</td>
                        <td className="p-5 font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">{dayBookings} booking(s)</td>
                        <td className="p-5">
                          <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 shadow-inner transition-colors duration-300">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
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
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden transition-colors duration-300">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          
          <h2 className="text-2xl font-extrabold mb-8 flex items-center gap-3 relative z-10"><span>📈</span> Executive Summary</h2>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Period</p>
              <p className="font-bold text-xl">
                {filterType === 'today'  && 'Today'}
                {filterType === 'week'   && 'Last 7 Days'}
                {filterType === 'month'  && 'Last 30 Days'}
                {filterType === 'custom' && `${dateRange.startDate} to ${dateRange.endDate}`}
                {filterType === 'all'    && 'All Time'}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Unique Customers</p>
              <p className="font-bold text-3xl">{new Set(filteredBookings.map((b) => b.user_email)).size}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Approval Rate</p>
              <p className="font-bold text-3xl text-green-400">
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