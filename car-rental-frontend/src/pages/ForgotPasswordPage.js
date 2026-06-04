import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { forgotPassword, resetPassword } from '../services/api';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [userName, setUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });
      if (response.data.success) {
        setDemoOtp(response.data.demoOtp);
        setUserName(response.data.userName);
        setStep(2);
        toast.success(`📱 SMS: Your RentWheels OTP is ${response.data.demoOtp}`, {
          duration: 8000,
          icon: '💬',
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    if (otp !== demoOtp) { toast.error('Invalid OTP. Please check and try again.'); return; }
    toast.success('OTP verified successfully!');
    setStep(3);
  };

  // Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setLoading(true);
    try {
      const response = await resetPassword({ email, otp, newPassword });
      if (response.data.success) {
        toast.success('Password reset successfully! Please login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  const stepIndicator = (currentStep) => (
    <div className="flex items-center justify-center gap-3 mb-10">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
            s < currentStep ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
            s === currentStep ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-110' :
            'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
          }`}>
            {s < currentStep ? '✓' : s}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 rounded-full transition-all duration-500 ${
              s < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex transition-colors duration-300">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=900&fit=crop"
          alt="Luxury Car"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white h-full">
          <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
          <p className="text-xl text-gray-200">Don't worry, we'll help you get back on the road in no time.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="w-full max-w-md backdrop-blur-md bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl p-10 transition-colors duration-300">
          
          {/* Step Indicator */}
          {stepIndicator(step)}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔑</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Forgot Password?</h1>
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Enter your registered email to receive an OTP</p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-6">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📱</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Verify OTP</h1>
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Hi <span className="font-semibold text-blue-600 dark:text-blue-400">{userName}</span>, enter the 6-digit code
                </p>
              </div>

              {/* Demo OTP hint */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 mb-6 transition-colors duration-300">
                <p className="text-sm font-bold text-blue-700 dark:text-blue-400 text-center">
                  🔔 Demo Mode: Your OTP is <span className="text-lg tracking-wider">{demoOtp}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-center text-2xl tracking-[0.5em] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner font-mono"
                    placeholder="• • • • • •"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white py-4 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition duration-300"
                >
                  Verify OTP
                </button>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="w-full text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors duration-300 disabled:opacity-50"
                >
                  {loading ? 'Resending...' : 'Resend OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔒</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors duration-300">New Password</h1>
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Create a strong new password for your account</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 transition-colors duration-300">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300 shadow-inner"
                    placeholder="••••••••"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-500 text-sm mt-2 font-medium">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || newPassword !== confirmPassword}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-4 rounded-xl font-bold shadow-lg transform hover:-translate-y-1 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p className="text-center mt-8 text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors duration-300">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
