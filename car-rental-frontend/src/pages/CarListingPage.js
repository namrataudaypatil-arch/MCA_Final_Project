import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCars } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=300&fit=crop';

const CAR_IMAGES = {
  'Tesla Model 3': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&h=300&fit=crop',
  'BMW X5': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop',
  'Mercedes C-Class': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500&h=300&fit=crop',
  'Audi A6': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop',
  'Toyota Camry': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop',
  'Honda CR-V': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&h=300&fit=crop',
};

function CarListingPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await getCars();
        console.log('Cars from backend:', response.data);

        const apiCars = response.data.cars || response.data || [];

        const mappedCars = apiCars.map((car) => ({
          id: car.id,
          name: car.name,
          price: car.price_per_day || car.price,
          image: car.image_url || CAR_IMAGES[car.name] || DEFAULT_IMAGE,
          type: car.type,
          year: car.year || 2023,
          seats: car.seats,
          isBooked: Boolean(car.is_currently_booked),
        }));

        setCars(mappedCars);
      } catch (error) {
        console.error('Error fetching cars from backend:', error);

        const fallbackCars = Object.keys(CAR_IMAGES).map((name, index) => ({
          id: index + 1,
          name,
          price: [7499, 9999, 8749, 8249, 4499, 5499][index],
          image: CAR_IMAGES[name],
          type: ['Electric', 'SUV', 'Luxury', 'Luxury', 'Economy', 'SUV'][index],
          year: 2023,
          seats: [5, 7, 5, 5, 5, 5][index],
          isBooked: false,
        }));

        setCars(fallbackCars);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4 transition-colors duration-300">Our Fleet</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg transition-colors duration-300">
          Choose from our premium collection of vehicles
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {cars.map((car) => (
            <div
              key={car.id}
              className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-xl overflow-hidden transition-all hover:shadow-2xl transform hover:-translate-y-2 relative duration-300"
            >
              {car.isBooked && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                  Currently Booked
                </div>
              )}
              <img
                src={car.image}
                alt={car.name}
                className={`w-full h-48 object-cover ${car.isBooked ? 'opacity-80' : ''}`}
                onError={(e) => {
                  e.target.src = DEFAULT_IMAGE;
                }}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white transition-colors duration-300">{car.name}</h3>
                <div className="flex justify-between text-gray-500 dark:text-gray-400 mb-3 text-sm transition-colors duration-300">
                  <span>{car.type}</span>
                  <span>{car.seats} seats</span>
                  <span>{car.year}</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-400 mb-4 transition-colors duration-300">
                  {formatPrice(car.price)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/day</span>
                </p>
                <Link
                  to={`/booking/${car.id}`}
                  className="block text-center bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-3 rounded-xl font-bold shadow-md transition transform hover:-translate-y-0.5"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CarListingPage;
