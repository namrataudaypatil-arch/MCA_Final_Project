import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getUserBookings, cancelBooking } from '../services/api';

function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '⏳', label: 'Pending Approval' },
      approved: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: '✅', label: 'Approved' },
      declined: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: '❌', label: 'Declined' },
      cancelled: { bg: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300', icon: '🗑️', label: 'Cancelled' },
    };
    const s = map[status] || { bg: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300', icon: '🔘', label: status || 'Unknown' };
    return (
      <div className={`${s.bg} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
        <span>{s.icon}</span> {s.label}
      </div>
    );
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await getUserBookings(); // JWT attached automatically
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Could not load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId, status) => {
    if (status === 'approved') {
      toast.error('Cannot cancel an approved booking. Please contact admin.'); return;
    }
    if (status === 'declined' || status === 'cancelled') {
      toast.error(`This booking is already ${status}.`); return;
    }
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await cancelBooking(bookingId);
      if (response.data.success) {
        toast.success('Booking cancelled successfully!');
        loadBookings();
      } else {
        toast.error(response.data.message || 'Could not cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Error cancelling booking');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-20 text-center transition-colors duration-300">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mb-4"></div>
        <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">Loading your bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-20 px-4 text-center transition-colors duration-300">
        <div className="text-6xl mb-4">📅</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">No Bookings Yet</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">You haven't made any bookings yet.</p>
        <Link to="/cars" className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold inline-block shadow-lg transform hover:-translate-y-1 transition duration-300">
          Browse Cars
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">My Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
            You have {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
          </p>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => {
            const id = booking.id || booking.booking_id;
            const carName = booking.carName || booking.car_name;
            const formatDate = (dateString) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              if (isNaN(date.getTime())) return dateString;
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd}`;
            };
            const startDate = formatDate(booking.startDate || booking.start_date);
            const endDate = formatDate(booking.endDate || booking.end_date);
            const totalPrice = booking.totalPrice || booking.total_price;

            return (
              <div key={id} className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1">
                      {/* Car image / name */}
                      <div className="flex items-center gap-4 mb-4">
                        {booking.image_url ? (
                          <img
                            src={booking.image_url}
                            alt={carName}
                            className="w-20 h-16 object-cover rounded-xl shadow-md"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-4xl">🚗</span>
                        )}
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{carName}</h3>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Booking ID: #{id}</p>
                        </div>
                      </div>

                      <div className="mb-3">{getStatusBadge(booking.status)}</div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          <span>📅</span>
                          <span><span className="font-semibold text-gray-800 dark:text-white">Pickup:</span> {startDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          <span>🔄</span>
                          <span><span className="font-semibold text-gray-800 dark:text-white">Return:</span> {endDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          <span>⏱️</span>
                          <span><span className="font-semibold text-gray-800 dark:text-white">Duration:</span> {booking.days} {booking.days === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                          <span>💰</span>
                          <span><span className="font-semibold text-gray-800 dark:text-white">Amount:</span> {formatPrice(totalPrice)}</span>
                        </div>
                      </div>

                      {/* Status messages */}
                      {booking.status === 'pending' && (
                        <div className="mt-5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-3 text-sm font-medium text-yellow-800 dark:text-yellow-400 transition-colors duration-300">
                          ⏳ Your booking request is waiting for admin approval.
                        </div>
                      )}
                      {booking.status === 'approved' && (
                        <div className="mt-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 text-sm font-medium text-green-800 dark:text-green-400 transition-colors duration-300">
                          ✅ Your booking is confirmed! Just show your ID at pickup.
                        </div>
                      )}
                      {booking.status === 'declined' && (
                        <div className="mt-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-3 text-sm font-medium text-red-800 dark:text-red-400 transition-colors duration-300">
                          ❌ Sorry, your booking was declined. Refund will be processed within 3–5 business days.
                        </div>
                      )}
                      {booking.status === 'cancelled' && (
                        <div className="mt-5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          🗑️ This booking has been cancelled. Refund will be processed within 3–5 business days.
                        </div>
                      )}
                    </div>

                    {/* Right side actions */}
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 mb-4 transition-colors duration-300">{formatPrice(totalPrice)}</p>

                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(id, booking.status)}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transform hover:-translate-y-1 transition duration-300 font-bold"
                        >
                          Cancel Booking
                        </button>
                      )}
                      {booking.status === 'approved' && (
                        <button disabled className="px-6 py-3 bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-xl font-bold cursor-not-allowed transition-colors duration-300 shadow-none">
                          Confirmed
                        </button>
                      )}
                      {(booking.status === 'declined' || booking.status === 'cancelled') && (
                        <Link to="/cars" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white rounded-xl shadow-md transform hover:-translate-y-1 transition duration-300 font-bold">
                          Book Again
                        </Link>
                      )}

                      <p className="text-xs font-semibold text-gray-400 mt-4 transition-colors duration-300">
                        Booked on:{' '}
                        {new Date(booking.bookingDate || booking.booking_date || booking.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default BookingHistoryPage;