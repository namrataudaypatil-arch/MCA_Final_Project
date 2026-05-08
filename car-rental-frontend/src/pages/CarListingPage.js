import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop';

function CarListingPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await getCars();
        const apiCars = response.data.cars || [];
        setCars(apiCars);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mb-4"></div>
          <p className="text-gray-600">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Our Fleet</h1>
        <p className="text-center text-gray-600 mb-12 text-lg">
          Choose from our premium collection of vehicles
        </p>

        {cars.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-xl text-gray-600">No cars available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105 relative"
              >
                {car.is_currently_booked && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10 animate-pulse">
                    Currently Booked
                  </div>
                )}
                <img
                  src={car.image_url || DEFAULT_IMAGE}
                  alt={car.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{car.name}</h3>
                  <p className="text-gray-500 text-sm mb-1">{car.brand}</p>
                  <div className="flex justify-between text-gray-500 mb-3 text-sm">
                    <span>{car.type}</span>
                    <span>{car.seats} seats</span>
                    <span>{car.year}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mb-4">
                    {formatPrice(car.price_per_day)}
                    <span className="text-sm font-normal text-gray-500">/day</span>
                  </p>
                  <Link
                    to={`/booking/${car.id}`}
                    className="block text-center bg-blue-900 text-white py-2 rounded-full font-semibold hover:bg-blue-800 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CarListingPage;