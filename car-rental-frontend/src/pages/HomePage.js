import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Admin Home Page
  if (isAdmin) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Admin Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 px-4">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-6xl mx-auto text-center z-10">
            <div className="mb-6">
              <span className="text-7xl">👨‍💼</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Admin Dashboard
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Manage your car rental business from one central location
            </p>
          </div>
        </section>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Cars</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {JSON.parse(localStorage.getItem('admin_cars') || '[]').length || 10}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚗</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {JSON.parse(localStorage.getItem('users') || '[]').length + 1}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {JSON.parse(localStorage.getItem('bookings') || '[]').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-600 hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-800">
                    ₹{JSON.parse(localStorage.getItem('bookings') || '[]').reduce((sum, b) => sum + b.totalPrice, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/admin/cars" className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚗</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Manage Cars</h3>
              <p className="text-gray-500 text-sm">Add, edit, or remove cars</p>
            </Link>
            
            <Link to="/admin/users" className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Manage Users</h3>
              <p className="text-gray-500 text-sm">View all registered users</p>
            </Link>
            
            <Link to="/admin/bookings" className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">All Bookings</h3>
              <p className="text-gray-500 text-sm">View and manage bookings</p>
            </Link>
            
            <Link to="/admin/reports" className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Reports</h3>
              <p className="text-gray-500 text-sm">View revenue analytics</p>
            </Link>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {JSON.parse(localStorage.getItem('bookings') || '[]').slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {JSON.parse(localStorage.getItem('bookings') || '[]').slice(0, 5).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xl">🚗</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{booking.carName}</p>
                          <p className="text-sm text-gray-500">Booked by: {booking.userEmail || 'User'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{booking.startDate} → {booking.endDate}</p>
                        <p className="font-semibold text-blue-600">₹{booking.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular User Home Page
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat py-24 px-4"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&h=700&fit=crop")',
          backgroundAttachment: 'fixed'
        }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Rent your dream car
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Choose from our wide range of luxury and economy cars at the best prices.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/cars" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
              Browse Cars →
            </Link>
            <Link to="/register" className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold border-2 border-white hover:bg-transparent hover:text-white transition">
              Register Now
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Choose from 50+ premium vehicles</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Fully Insured</h3>
              <p className="text-gray-600">Complete protection coverage</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive rates, no hidden fees</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;