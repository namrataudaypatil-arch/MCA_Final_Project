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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Car Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This car does not exist.'}</p>
          <Link to="/cars" className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition">
            Back to Cars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/cars" className="inline-flex items-center text-blue-900 hover:text-blue-700 mb-6 transition">
          ← Back to Cars
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
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
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{car.name}</h1>
              <p className="text-blue-600 font-semibold mb-4">{car.brand}</p>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">📅</span>
                  <span>{car.year}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">⚙️</span>
                  <span>{car.transmission || 'Automatic'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">👥</span>
                  <span>{car.seats} Seats</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">⛽</span>
                  <span>{car.fuel_type || 'Petrol'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">🔧</span>
                  <span>{car.type}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xl">✅</span>
                  <span>{car.is_available !== false ? 'Available' : 'Not Available'}</span>
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-b py-4 mb-6">
                <p className="text-3xl font-bold text-blue-900">
                  {formatPrice(car.price_per_day)}
                  <span className="text-sm font-normal text-gray-500">/day</span>
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                {car.description ||
                  'Experience luxury and comfort with this premium vehicle. Perfect for any occasion, whether business or leisure.'}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Features:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['GPS Navigation', 'Bluetooth', 'Backup Camera', 'Cruise Control', 'Air Conditioning', 'Power Steering'].map(
                    (f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500">✓</span> {f}
                      </div>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={car.is_available === false}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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