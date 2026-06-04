import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createBooking, createPayment } from '../services/api';

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  useEffect(() => {
    if (location.state?.bookingData) {
      setBookingData(location.state.bookingData);
    } else {
      toast.error('Booking information missing');
      navigate('/cars');
    }
  }, [location, navigate]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const generateTransactionId = () =>
    'TXN' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

  const savePaymentAndBooking = async (paidAmount, transactionId, paymentStatus) => {
    const bookingPayload = {
      carId: bookingData.carId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      days: bookingData.days,
      totalPrice: bookingData.totalPrice,
      paidAmount,
      paymentMethod,
      paymentStatus,
      status: 'pending',
    };

    try {
      // 1. Create booking in DB (uses authenticated user from JWT)
      const bookingResponse = await createBooking(bookingPayload);
      if (!bookingResponse.data.success) return false;

      const newBookingId =
        bookingResponse.data.booking?.id || bookingResponse.data.booking?.booking_id;

      // 2. Record payment in DB
      const paymentPayload = {
        bookingId: newBookingId,
        amount: paidAmount,
        paymentMethod,
        transactionId,
      };
      await createPayment(paymentPayload);

      // 3. Navigate to confirmation (NO localStorage write)
      const confirmationBooking = {
        id: newBookingId,
        carId: bookingData.carId,
        carName: bookingData.carName,
        carImage: bookingData.carImage,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        days: bookingData.days,
        pricePerDay: bookingData.pricePerDay,
        totalPrice: bookingData.totalPrice,
        paidAmount,
        paymentMethod,
        transactionId,
        bookingDate: new Date().toISOString(),
        status: 'pending',
      };

      navigate('/booking-confirmation', { state: { booking: confirmationBooking } });
      return true;
    } catch (error) {
      console.error('Booking/payment error:', error);
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
      return false;
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !expiry || !cvv) {
        toast.error('Please fill all card details'); return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Please enter a valid 16-digit card number'); return;
      }
      if (cvv.length < 3) {
        toast.error('Please enter a valid CVV'); return;
      }
    }
    if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g., username@bank)'); return;
      }
    }

    const payableAmount = bookingData.totalPrice;
    const transactionId = generateTransactionId();

    // Cash payment — no OTP needed
    if (paymentMethod === 'cash') {
      setLoading(true);
      toast.success('Booking confirmed! Please pay at pickup.');
      await savePaymentAndBooking(payableAmount, transactionId, 'pending_payment');
      setLoading(false);
      return;
    }

    // Card / UPI / Net banking — show OTP step first
    if (!showOTP) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setShowOTP(true);
      
      // Toast notification acting as the "SMS"
      toast.success(`SMS: Your CAR RENTAL WEBSITE OTP is ${newOtp}`, {
        duration: 6000,
        icon: '💬',
      });
      return;
    }

    // Verify OTP
    if (otp !== generatedOtp) {
      toast.error('Invalid OTP. Please check the code and try again.');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        toast.success('Payment successful! Booking confirmed.');
        await savePaymentAndBooking(payableAmount, transactionId, 'confirmed');
      } catch {
        toast.error('Payment failed. Please try again.');
      }
      setLoading(false);
    }, 1500);
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Secure Payment</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Complete your booking by making full payment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl p-8 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-300">Payment Details</h2>

              {/* Full Payment Notice */}
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="font-bold text-blue-900 dark:text-blue-400">Full Payment Required</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Pay 100% now to confirm your booking</p>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-3 transition-colors duration-300">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'card', icon: '💳', label: 'Credit/Debit Card' },
                    { id: 'upi',  icon: '📱', label: 'UPI' },
                    { id: 'netbanking', icon: '🏦', label: 'Net Banking' },
                    { id: 'cash', icon: '💰', label: 'Cash at Pickup' },
                  ].map(({ id, icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => { setPaymentMethod(id); setShowOTP(false); setOtp(''); }}
                      className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-colors duration-300 ${
                        paymentMethod === id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400' : 'border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="font-bold text-sm md:text-base">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && !showOTP && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                        if (v.length > 19) v = v.slice(0, 19);
                        setCardNumber(v);
                      }}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner tracking-widest"
                      maxLength="19"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="JOHN DOE"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\//g, '').replace(/(\d{2})(\d{1,2})/, '$1/$2');
                          if (v.length > 5) v = v.slice(0, 5);
                          setExpiry(v);
                        }}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner tracking-widest"
                        maxLength="5"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.slice(0, 3))}
                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner tracking-widest"
                        maxLength="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Details */}
              {paymentMethod === 'upi' && !showOTP && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">UPI ID</label>
                  <input
                    type="text"
                    placeholder="username@bank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner"
                  />
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === 'netbanking' && !showOTP && (
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Select Bank</label>
                  <select className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Yes Bank</option>
                  </select>
                </div>
              )}

              {/* OTP Verification */}
              {showOTP && (
                <div className="mt-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl transition-colors duration-300">
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-2">Enter OTP</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">A 6-digit OTP has been sent to your registered mobile number.</p>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4">(Demo Mode: Please enter {generatedOtp})</p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-5 py-4 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl text-center text-xl tracking-[0.5em] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 shadow-inner"
                    maxLength="6"
                  />
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full mt-8 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform hover:-translate-y-1 transition duration-300 disabled:opacity-50 disabled:transform-none"
              >
                {loading
                  ? 'Processing...'
                  : showOTP
                  ? 'Verify & Pay'
                  : paymentMethod === 'cash'
                  ? 'Confirm Booking (Pay at Pickup)'
                  : `Pay ${formatPrice(bookingData.totalPrice)} securely`}
              </button>

              {paymentMethod === 'cash' && (
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center mt-4 transition-colors duration-300">
                  You will pay {formatPrice(bookingData.totalPrice)} at pickup
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl p-8 sticky top-24 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-300">Booking Summary</h2>

              <div className="space-y-4 pb-6 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
                <div className="flex items-center gap-4">
                  {bookingData.carImage ? (
                    <img
                      src={bookingData.carImage}
                      alt={bookingData.carName}
                      className="w-20 h-16 object-cover rounded-xl shadow-md"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-4xl">🚗</span>
                  )}
                  <div>
                    <p className="font-bold text-lg text-gray-800 dark:text-white transition-colors duration-300">{bookingData.carName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{formatPrice(bookingData.pricePerDay)}/day</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 py-6 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Pickup Date</span>
                  <span className="font-bold text-gray-800 dark:text-white">{bookingData.startDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Return Date</span>
                  <span className="font-bold text-gray-800 dark:text-white">{bookingData.endDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Duration</span>
                  <span className="font-bold text-gray-800 dark:text-white">{bookingData.days} days</span>
                </div>
              </div>

              <div className="space-y-3 py-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Daily Rate × {bookingData.days}</span>
                  <span className="font-bold text-gray-800 dark:text-white">{formatPrice(bookingData.pricePerDay * bookingData.days)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-xl pt-4 border-t border-gray-200 dark:border-slate-700 transition-colors duration-300">
                  <span className="text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-blue-700 dark:text-blue-400">{formatPrice(bookingData.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
