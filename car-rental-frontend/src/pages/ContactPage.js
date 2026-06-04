import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat py-20 px-4"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1422225518311-9e4e6b21e845?w=1600&h=400&fit=crop")',
        }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-200">We're here to help 24/7</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-8 transition-colors duration-300">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-inner transition-colors duration-300">
                  <span className="text-2xl">📍</span>
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white transition-colors duration-300">Visit Us</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-1">123 Rental Street, City, 12345</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-inner transition-colors duration-300">
                  <span className="text-2xl">📞</span>
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white transition-colors duration-300">Call Us</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-1">+1 234 567 890</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1 transition-colors duration-300">Mon-Sun, 24/7</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-inner transition-colors duration-300">
                  <span className="text-2xl">✉️</span>
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white transition-colors duration-300">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-1">support@carrentalwebsite.com</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1 transition-colors duration-300">Response within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="mt-10 p-8 backdrop-blur-md bg-blue-50/80 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 rounded-3xl shadow-lg transition-colors duration-300">
              <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
                <span>📅</span> Business Hours
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 pb-3">
                  <span className="font-medium">Monday - Friday:</span>
                  <span className="font-bold text-gray-900 dark:text-white transition-colors duration-300">9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-medium">Saturday - Sunday:</span>
                  <span className="font-bold text-gray-900 dark:text-white transition-colors duration-300">10:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl p-8 md:p-10 transition-colors duration-300">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 transition-colors duration-300">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner"
                  placeholder="Booking Inquiry"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition duration-300 mt-2"
              >
                Send Message →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
