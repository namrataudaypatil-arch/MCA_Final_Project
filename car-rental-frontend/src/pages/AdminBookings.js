import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getAdminBookings, approveBooking, declineBooking } from '../services/api';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await getAdminBookings(); // JWT attached automatically
      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        toast.error('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Error loading bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleAccept = async (bookingId) => {
    try {
      const response = await approveBooking(bookingId);
      if (response.data.success) {
        toast.success('Booking approved successfully!');
        loadBookings();
      } else {
        toast.error(response.data.message || 'Failed to approve booking');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error approving booking');
    }
  };

  const handleDecline = async (bookingId) => {
    if (!window.confirm('Are you sure you want to decline this booking?')) return;
    try {
      const response = await declineBooking(bookingId);
      if (response.data.success) {
        toast.success('Booking declined.');
        loadBookings();
      } else {
        toast.error(response.data.message || 'Failed to decline booking');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error declining booking');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600',
    };
    const icons = { pending: '⏳', approved: '✅', declined: '❌', cancelled: '🗑️' };
    return (
      <span className={`${map[status] || 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300'} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-colors duration-300`}>
        <span className="mr-1">{icons[status] || '🔘'}</span> {status}
      </span>
    );
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(price);

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">All Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">View and manage all customer bookings</p>

          {pendingCount > 0 && (
            <div className="mt-6 backdrop-blur-md bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm transition-colors duration-300">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <span className="font-bold text-yellow-800 dark:text-yellow-400 text-lg">{pendingCount} pending booking(s)</span>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">Need your approval</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { key: 'all', label: 'All', active: 'bg-blue-900 text-white dark:bg-blue-600 shadow-md' },
            { key: 'pending', label: `Pending (${pendingCount})`, active: 'bg-yellow-600 text-white shadow-md dark:bg-yellow-600' },
            { key: 'approved', label: 'Approved', active: 'bg-green-600 text-white shadow-md dark:bg-green-600' },
            { key: 'declined', label: 'Declined', active: 'bg-red-600 text-white shadow-md dark:bg-red-600' },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${filter === key ? active : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl p-12 text-center transition-colors duration-300">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">No Bookings Found</h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">No bookings match the selected filter.</p>
          </div>
        ) : (
          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
                  <tr>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">ID</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">User</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Car</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Dates</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Days</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Total</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Paid</th>
                    <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 transition-colors duration-300">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-300">
                      <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">#{booking.id}</td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{booking.user_name || 'Guest'}</p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">{booking.user_email}</p>
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white transition-colors duration-300">{booking.car_name}</td>
                      <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-colors duration-300">
                        {formatDate(booking.start_date)} <span className="text-gray-400 mx-1">→</span> {formatDate(booking.end_date)}
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">{booking.days}</td>
                      <td className="p-4 font-extrabold text-blue-600 dark:text-blue-400 transition-colors duration-300">{formatPrice(booking.total_price)}</td>
                      <td className="p-4 font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{formatPrice(booking.paid_amount || 0)}</td>
                      <td className="p-4">{getStatusBadge(booking.status)}</td>
                      <td className="p-4 text-center">
                        {booking.status === 'pending' && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleAccept(booking.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 transition transform hover:-translate-y-0.5"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleDecline(booking.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-red-700 transition transform hover:-translate-y-0.5"
                            >
                              ✗ Decline
                            </button>
                          </div>
                        )}
                        {booking.status === 'approved' && <span className="text-green-600 dark:text-green-400 font-bold text-sm transition-colors duration-300">Approved</span>}
                        {booking.status === 'declined' && <span className="text-red-600 dark:text-red-400 font-bold text-sm transition-colors duration-300">Declined</span>}
                        {booking.status === 'cancelled' && <span className="text-gray-500 dark:text-gray-400 font-bold text-sm transition-colors duration-300">Cancelled</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookings;