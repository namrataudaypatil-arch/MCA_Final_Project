import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getUserBookings } from '../services/api';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get booking from location state or fetch from backend
  useEffect(() => {
    const fetchBooking = async () => {
      // First check if booking data was passed via state
      if (location.state?.booking) {
        setBooking(location.state.booking);
        setLoading(false);
        return;
      }
      
      // If no booking in state, try to get the latest booking from backend
      try {
        const response = await getUserBookings();
        console.log('Latest bookings:', response.data);
        
        if (response.data.success && response.data.bookings.length > 0) {
          // Get the most recent booking
          const latestBooking = response.data.bookings[0];
          setBooking(latestBooking);
        } else {
          toast.error('No booking found');
          navigate('/cars');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Error loading booking details');
        navigate('/cars');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [location, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleDownloadInvoice = () => {
    // Create invoice content
    const invoiceContent = `
      CAR RENTAL WEBSITE INVOICE
      ==================
      Booking ID: ${booking.booking_id || booking.id}
      Car: ${booking.car_name || booking.carName}
      Pickup Date: ${booking.start_date || booking.startDate}
      Return Date: ${booking.end_date || booking.endDate}
      Duration: ${booking.days} days
      Total Amount: ${formatPrice(booking.total_price || booking.totalPrice)}
      Payment Method: ${booking.payment_method || booking.paymentMethod}
      
      Thank you for choosing CAR RENTAL WEBSITE!
    `;
    
    // Create blob and download
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${booking.booking_id || booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded!');
  };

  const handleShare = () => {
    const shareText = `CAR RENTAL WEBSITE Booking Confirmed!\n\nBooking ID: #${booking.booking_id || booking.id}\nCar: ${booking.car_name || booking.carName}\nDates: ${booking.start_date || booking.startDate} to ${booking.end_date || booking.endDate}\nTotal: ${formatPrice(booking.total_price || booking.totalPrice)}\n\nThank you for choosing CAR RENTAL WEBSITE!`;
    
    // Create WhatsApp Share URL
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 border-4 border-green-500 dark:border-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Booking Confirmed!</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Your booking has been successfully confirmed</p>
        </div>

        {/* Booking Details */}
        <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden mb-8 transition-colors duration-300">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-5 text-white shadow-inner">
            <h2 className="font-bold text-lg">Booking ID: #{booking.booking_id || booking.id}</h2>
          </div>
          
          <div className="p-8">
            <div className="flex items-center gap-6 pb-6 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
              {(booking.image_url || booking.car_image || booking.carImage) ? (
                <img 
                  src={booking.image_url || booking.car_image || booking.carImage} 
                  alt={booking.car_name || booking.carName} 
                  className="w-24 h-16 object-cover rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="text-3xl font-bold text-blue-900">CAR</span>
              )}
              <div>
                <h3 className="text-xl font-bold">{booking.car_name || booking.carName}</h3>
                <p className="text-gray-500">{booking.price_per_day || booking.pricePerDay}/day</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Pickup Date</p>
                <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{booking.start_date || booking.startDate}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Return Date</p>
                <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{booking.end_date || booking.endDate}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Duration</p>
                <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300">{booking.days} days</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Payment Method</p>
                <p className="font-bold text-gray-900 dark:text-white transition-colors duration-300 capitalize">{booking.payment_method || booking.paymentMethod || 'Card'}</p>
              </div>
            </div>

            <div className="py-6">
              <div className="flex justify-between mb-3 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                <span>Total Amount</span>
                <span className="font-bold text-lg">{formatPrice(booking.total_price || booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400 transition-colors duration-300">
                <span>Amount Paid</span>
                <span className="font-bold text-lg">{formatPrice(booking.paid_amount || booking.paidAmount || (booking.total_price || booking.totalPrice))}</span>
              </div>
              {(booking.remaining_amount || (booking.total_price - booking.paid_amount)) > 0 && (
                <div className="flex justify-between text-orange-600 dark:text-orange-400 mt-3 transition-colors duration-300">
                  <span>Remaining at Pickup</span>
                  <span className="font-bold text-lg">{formatPrice((booking.total_price || booking.totalPrice) - (booking.paid_amount || booking.paidAmount || 0))}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={handleDownloadInvoice} className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white py-4 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-600 transition duration-300 shadow-md transform hover:-translate-y-1">
            Download Invoice
          </button>
          <button onClick={handleShare} className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-4 rounded-xl font-bold transition duration-300 shadow-md transform hover:-translate-y-1">
            Share Details
          </button>
          <Link to="/bookings" className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-center transition duration-300 shadow-md transform hover:-translate-y-1">
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
