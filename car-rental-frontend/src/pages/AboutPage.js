import React from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat py-24 px-4"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&h=500&fit=crop")',
          backgroundAttachment: 'fixed'
        }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            About RentWheels
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Your trusted partner for premium car rentals since 2020
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Our Story
              </h2>
              <div className="w-20 h-1 bg-blue-900 mb-6"></div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                RentWheels was founded with a simple mission: to provide premium car rental experiences at affordable prices. We believe that everyone deserves to drive their dream car, whether it's for a special occasion or everyday needs.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                What started as a small fleet of 5 cars has now grown into a premium car rental service with over 50+ vehicles, serving thousands of satisfied customers across the country.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our commitment to quality, transparency, and customer service sets us apart from the competition. We're not just renting cars; we're creating unforgettable driving experiences.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold mb-2">5+ Years of Excellence</h3>
                <p className="text-blue-100">Serving thousands of satisfied customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-pulse">
              <div className="text-5xl mb-3">🚗</div>
              <div className="text-4xl font-bold mb-1">50+</div>
              <p className="text-blue-100">Premium Vehicles</p>
            </div>
            <div className="animate-pulse delay-100">
              <div className="text-5xl mb-3">👥</div>
              <div className="text-4xl font-bold mb-1">10K+</div>
              <p className="text-blue-100">Happy Customers</p>
            </div>
            <div className="animate-pulse delay-200">
              <div className="text-5xl mb-3">📍</div>
              <div className="text-4xl font-bold mb-1">15+</div>
              <p className="text-blue-100">Locations</p>
            </div>
            <div className="animate-pulse delay-300">
              <div className="text-5xl mb-3">⭐</div>
              <div className="text-4xl font-bold mb-1">4.9</div>
              <p className="text-blue-100">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Core Values
            </h2>
            <div className="w-20 h-1 bg-blue-900 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-900 transition">
                <span className="text-3xl group-hover:text-white">🔧</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Service</h3>
              <p className="text-gray-600">We maintain the highest standards of vehicle quality and customer service.</p>
            </div>
            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-900 transition">
                <span className="text-3xl group-hover:text-white">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Best Prices</h3>
              <p className="text-gray-600">Competitive rates with no hidden fees, guaranteed.</p>
            </div>
            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-900 transition">
                <span className="text-3xl group-hover:text-white">🛡️</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Fully Insured</h3>
              <p className="text-gray-600">Complete protection with comprehensive insurance coverage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Meet Our Team
            </h2>
            <div className="w-20 h-1 bg-blue-900 mx-auto"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Dedicated professionals committed to giving you the best car rental experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-40 h-40 bg-gradient-to-r from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">👨‍💼</span>
              </div>
              <h3 className="text-xl font-bold">John Smith</h3>
              <p className="text-blue-600 mb-2">CEO & Founder</p>
              <p className="text-gray-500 text-sm">10+ years in automotive industry</p>
            </div>
            <div className="text-center">
              <div className="w-40 h-40 bg-gradient-to-r from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">👩‍💼</span>
              </div>
              <h3 className="text-xl font-bold">Sarah Johnson</h3>
              <p className="text-blue-600 mb-2">Operations Manager</p>
              <p className="text-gray-500 text-sm">Customer satisfaction expert</p>
            </div>
            <div className="text-center">
              <div className="w-40 h-40 bg-gradient-to-r from-blue-900 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">👨‍🔧</span>
              </div>
              <h3 className="text-xl font-bold">Mike Williams</h3>
              <p className="text-blue-600 mb-2">Fleet Manager</p>
              <p className="text-gray-500 text-sm">Vehicle maintenance specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to hit the road?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers who trust RentWheels for their car rental needs.
          </p>
          <Link 
            to="/cars" 
            className="inline-block bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105"
          >
            Browse Our Fleet →
          </Link>
        </div>
      </section>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}

export default AboutPage;