import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getCarById, checkCarAvailability } from '../services/api';

function BookingPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  // Fetch car details from backend
  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoadingCar(true);
        const response = await getCarById(carId);
        setCar(response.data.car);
      } catch (error) {
        console.error('Error fetching car:', error);
        toast.error('Car not found');
        navigate('/cars');
      } finally {
        setLoadingCar(false);
      }
    };
    fetchCar();
  }, [carId, navigate]);

  // Adjust endDate if startDate changes and endDate is before startDate
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      toast.error('Return date must be after pickup date');
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  // Check availability via backend API whenever dates change
  useEffect(() => {
    if (!startDate || !endDate || !car) {
      setIsAvailable(true);
      return;
    }

    const check = async () => {
      setCheckingAvailability(true);
      try {
        const response = await checkCarAvailability(car.id, { startDate, endDate });
        setIsAvailable(response.data.available);
      } catch {
        // fallback: assume available if check fails
        setIsAvailable(true);
      } finally {
        setCheckingAvailability(false);
      }
    };
    check();
  }, [startDate, endDate, car]);

  // Recalculate price
  useEffect(() => {
    if (startDate && endDate && car && isAvailable) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      setDays(diffDays);
      setTotalPrice(diffDays * (car.price_per_day || 0));
    } else {
      setDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, car, isAvailable]);

  const handleProceedToPayment = () => {
    if (!startDate) { toast.error('Please select pickup date'); return; }
    if (!endDate) { toast.error('Please select return date'); return; }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(startDate) < today) { toast.error('Pickup date cannot be in the past'); return; }
    if (new Date(startDate) > new Date(endDate)) { toast.error('Return date must be after pickup date'); return; }
    if (!isAvailable) { toast.error('Sorry! This car is already booked for selected dates.'); return; }

    const bookingData = {
      carId: car.id,
      carName: car.name,
      carImage: car.image_url || null,
      startDate,
      endDate,
      days,
      pricePerDay: car.price_per_day,
      totalPrice,
    };

    navigate('/payment', { state: { bookingData } });
  };

  if (loadingCar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-800">Car Not Found</h1>
          <Link to="/cars" className="inline-block mt-4 text-blue-900 hover:underline">Back to Cars</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Complete Your Booking</h1>
          <p className="text-gray-500">Fill in the details to reserve your car</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Car Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white">
            <div className="flex items-center gap-4">
              {car.image_url ? (
                <img
                  src={car.image_url}
                  alt={car.name}
                  className="w-20 h-16 object-cover rounded-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="text-5xl">🚗</div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{car.name}</h2>
                <p className="text-blue-200">{formatPrice(car.price_per_day)} per day</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Date Pickers */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">📅 Pickup Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">📅 Return Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (startDate && selectedDate < startDate) {
                      toast.error('Return date must be after pickup date');
                      setEndDate(startDate);
                    } else {
                      setEndDate(selectedDate);
                    }
                  }}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                  disabled={!startDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Availability Status */}
            {startDate && endDate && (
              <div className={`p-4 rounded-xl mb-6 ${checkingAvailability ? 'bg-gray-50 border border-gray-200' : isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {checkingAvailability ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Checking availability...</span>
                  </div>
                ) : isAvailable ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="text-xl">✓</span>
                    <span className="font-semibold">Car is available for selected dates!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-xl">✗</span>
                    <span className="font-semibold">This car is booked for selected dates.</span>
                  </div>
                )}
              </div>
            )}

            {/* Price Summary */}
            {days > 0 && totalPrice > 0 && isAvailable && (
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-lg mb-3">💰 Price Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="font-medium">{formatPrice(car.price_per_day)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Days:</span>
                    <span className="font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-blue-900">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Booking Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Free cancellation up to 24 hours before pickup</li>
                <li>• Valid driving license required at pickup</li>
                <li>• Security deposit may be required</li>
                <li>• Car must be returned with same fuel level</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={!isAvailable || !startDate || !endDate || checkingAvailability}
              className={`w-full py-3 rounded-xl font-semibold transition transform hover:scale-105 ${isAvailable && startDate && endDate && !checkingAvailability
                  ? 'bg-blue-900 text-white hover:bg-blue-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isAvailable ? 'Book Now' : 'This car is booked for selected dates'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
