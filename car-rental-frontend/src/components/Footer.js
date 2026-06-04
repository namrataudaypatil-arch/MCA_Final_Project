import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">CAR RENTAL WEBSITE</h2>
            <p className="text-sm">Your trusted partner for premium car rentals.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
              <li><Link to="/cars" className="hover:text-blue-400">Cars</Link></li>
              <li><Link to="/about" className="hover:text-blue-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => alert('FAQ')} className="hover:text-blue-400">FAQ</button></li>
              <li><button onClick={() => alert('Terms')} className="hover:text-blue-400">Terms & Conditions</button></li>
              <li><button onClick={() => alert('Privacy')} className="hover:text-blue-400">Privacy Policy</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li>📍 123 Rental Street, City</li>
              <li>📞 +1 234 567 890</li>
              <li>support@carrentalwebsite.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-sm">
          <p>© 2024 CAR RENTAL WEBSITE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
