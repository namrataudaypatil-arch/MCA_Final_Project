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
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Pending Approval' },
      approved: { bg: 'bg-green-100 text-green-800', icon: '✅', label: 'Approved' },
      declined: { bg: 'bg-red-100 text-red-800', icon: '❌', label: 'Declined' },
      cancelled: { bg: 'bg-gray-100 text-gray-800', icon: '🗑️', label: 'Cancelled' },
    };
    const s = map[status] || { bg: 'bg-gray-100 text-gray-800', icon: '🔘', label: status || 'Unknown' };
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
      <div className="bg-gray-50 min-h-screen py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
        <p className="text-xl text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-20 px-4 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">No Bookings Yet</h1>
        <p className="text-gray-600 mb-6">You haven't made any bookings yet.</p>
        <Link to="/cars" className="bg-blue-900 text-white px-6 py-2 rounded-lg inline-block hover:bg-blue-800 transition">
          Browse Cars
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">My Bookings</h1>
          <p className="text-gray-500">
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
              <div key={id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      {/* Car image / name */}
                      <div className="flex items-center gap-3 mb-3">
                        {booking.image_url ? (
                          <img
                            src={booking.image_url}
                            alt={carName}
                            className="w-16 h-12 object-cover rounded-lg"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-4xl">🚗</span>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{carName}</h3>
                          <p className="text-sm text-gray-500">Booking ID: #{id}</p>
                        </div>
                      </div>

                      <div className="mb-3">{getStatusBadge(booking.status)}</div>

                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>📅</span>
                          <span><span className="font-medium">Pickup:</span> {startDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>🔄</span>
                          <span><span className="font-medium">Return:</span> {endDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>⏱️</span>
                          <span><span className="font-medium">Duration:</span> {booking.days} {booking.days === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>💰</span>
                          <span><span className="font-medium">Amount:</span> {formatPrice(totalPrice)}</span>
                        </div>
                      </div>

                      {/* Status messages */}
                      {booking.status === 'pending' && (
                        <div className="mt-3 bg-yellow-50 rounded-lg p-2 text-sm text-yellow-700">
                          ⏳ Your booking request is waiting for admin approval.
                        </div>
                      )}
                      {booking.status === 'approved' && (
                        <div className="mt-3 bg-green-50 rounded-lg p-2 text-sm text-green-700">
                          ✅ Your booking is confirmed! Just show your ID at pickup.
                        </div>
                      )}
                      {booking.status === 'declined' && (
                        <div className="mt-3 bg-red-50 rounded-lg p-2 text-sm text-red-700">
                          ❌ Sorry, your booking was declined. Refund will be processed within 3–5 business days.
                        </div>
                      )}
                      {booking.status === 'cancelled' && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-2 text-sm text-gray-700">
                          🗑️ This booking has been cancelled. Refund will be processed within 3–5 business days.
                        </div>
                      )}
                    </div>

                    {/* Right side actions */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900 mb-3">{formatPrice(totalPrice)}</p>

                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(id, booking.status)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                        >
                          Cancel Booking
                        </button>
                      )}
                      {booking.status === 'approved' && (
                        <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed">
                          Confirmed
                        </button>
                      )}
                      {(booking.status === 'declined' || booking.status === 'cancelled') && (
                        <Link to="/cars" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                          Book Again
                        </Link>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
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