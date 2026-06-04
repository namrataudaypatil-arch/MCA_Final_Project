import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Login successful!');
      // Redirect admin to admin dashboard, users to home
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(stored.role === 'admin' ? '/' : '/');
    } else {
      toast.error(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&h=900&fit=crop"
          alt="Luxury Car"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white h-full">
          <h2 className="text-4xl font-bold mb-4">Experience Premium Drive</h2>
          <p className="text-xl text-gray-200">Log in to unlock exclusive fleet access and start your journey today.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="w-full max-w-md backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl p-10 transition-colors duration-300">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Please login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-300">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login Securely'}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors duration-300">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;