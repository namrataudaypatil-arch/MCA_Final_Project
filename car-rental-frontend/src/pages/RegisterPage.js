import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerUser } from '../services/api';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await registerUser({ name, email, password });
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        // Redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        toast.error(error.response.data?.message || 'Registration failed');
      } else {
        toast.error('Network error. Please check if backend is running.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&h=900&fit=crop"
          alt="Luxury Car Fleet"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white h-full">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-gray-200">Register today to get instant access to our premium fleet of vehicles.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="w-full max-w-md backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl p-10 transition-colors duration-300">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Enter your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner" 
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner" 
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner" 
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Now'}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors duration-300">
              Login securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;