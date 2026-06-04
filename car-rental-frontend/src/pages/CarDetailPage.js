import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCarById } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop';

function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await getCarById(id);
        setCar(response.data.car);
        setError(null);
      } catch (err) {
        console.error('Error fetching car:', err);
        setError('Car not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleBooking = () => {
    navigate(`/booking/${car.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Car Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">{error || 'This car does not exist.'}</p>
          <Link to="/cars" className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition">
            Back to Cars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <Link to="/cars" className="inline-flex items-center text-blue-900 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors duration-300">
          ← Back to Cars
        </Link>

        <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300">
          <div className="md:flex">
            {/* Car Image — uses image_url from DB */}
            <div className="md:w-1/2">
              <img
                src={car.image_url || DEFAULT_IMAGE}
                alt={car.name}
                className="w-full h-80 md:h-full object-cover"
                onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
              />
            </div>

            {/* Car Info */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1 transition-colors duration-300">{car.name}</h1>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mb-4 transition-colors duration-300">{car.brand}</p>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <span className="text-xl">📅</span>
                  <span>{car.year}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <span className="text-xl">⚙️</span>
                  <span>{car.transmission || 'Automatic'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <span className="text-xl">👥</span>
                  <span>{car.seats} Seats</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <span className="text-xl">⛽</span>
                  <span>{car.fuel_type || 'Petrol'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <span className="text-xl">🔧</span>
                  <span>{car.type}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  <span className="text-xl">✅</span>
                  <span>{car.is_available !== false ? 'Available' : 'Not Available'}</span>
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-b dark:border-slate-700 py-4 mb-6 transition-colors duration-300">
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-400 transition-colors duration-300">
                  {formatPrice(car.price_per_day)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/day</span>
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
                {car.description ||
                  'Experience luxury and comfort with this premium vehicle. Perfect for any occasion, whether business or leisure.'}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 transition-colors duration-300">Features:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['GPS Navigation', 'Bluetooth', 'Backup Camera', 'Cruise Control', 'Air Conditioning', 'Power Steering'].map(
                    (f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        <span className="text-green-500">✓</span> {f}
                      </div>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={car.is_available === false}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {car.is_available === false ? 'Not Available' : 'Book This Car →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetailPage;