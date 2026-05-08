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
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    const icons = { pending: '⏳', approved: '✅', declined: '❌', cancelled: '🗑️' };
    return (
      <span className={`${map[status] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded-full text-xs font-semibold`}>
        {icons[status] || '🔘'} {status}
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
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">All Bookings</h1>
          <p className="text-gray-500">View and manage all customer bookings</p>

          {pendingCount > 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <span className="font-semibold text-yellow-800">{pendingCount} pending booking(s)</span>
                <p className="text-sm text-yellow-600">Need your approval</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: 'All', active: 'bg-blue-900 text-white' },
            { key: 'pending', label: `Pending (${pendingCount})`, active: 'bg-yellow-600 text-white' },
            { key: 'approved', label: 'Approved', active: 'bg-green-600 text-white' },
            { key: 'declined', label: 'Declined', active: 'bg-red-600 text-white' },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${filter === key ? active : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
            <p className="text-gray-600">No bookings match the selected filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Car</th>
                    <th className="p-3 text-left">Dates</th>
                    <th className="p-3 text-left">Days</th>
                    <th className="p-3 text-left">Total</th>
                    <th className="p-3 text-left">Paid</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">#{booking.id}</td>
                      <td className="p-3">
                        <p className="font-semibold">{booking.user_name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{booking.user_email}</p>
                      </td>
                      <td className="p-3 font-semibold">{booking.car_name}</td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                      </td>
                      <td className="p-3">{booking.days}</td>
                      <td className="p-3 font-bold text-blue-600">{formatPrice(booking.total_price)}</td>
                      <td className="p-3">{formatPrice(booking.paid_amount || 0)}</td>
                      <td className="p-3">{getStatusBadge(booking.status)}</td>
                      <td className="p-3 text-center">
                        {booking.status === 'pending' && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleAccept(booking.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition"
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleDecline(booking.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition"
                            >
                              ✗ Decline
                            </button>
                          </div>
                        )}
                        {booking.status === 'approved' && <span className="text-green-600 text-sm">Approved</span>}
                        {booking.status === 'declined' && <span className="text-red-600 text-sm">Declined</span>}
                        {booking.status === 'cancelled' && <span className="text-gray-500 text-sm">Cancelled</span>}
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