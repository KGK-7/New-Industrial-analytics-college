import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import API from '../utils/api';

const LoginForm = ({ onLoginSuccess, onLoginStart }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: reduxError } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onLoginStart) onLoginStart();
    setLocalError('');
    dispatch(loginStart());

    const email = formData.email;
    const password = formData.password;

    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data && response.data.access_token) {
        const { access_token, user } = response.data;
        dispatch(loginSuccess({ token: access_token, user }));
        if (onLoginSuccess) onLoginSuccess();
        else navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed';
      dispatch(loginFailure(errorMessage));
      setLocalError(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign In</h2>
        <p className="text-slate-700 text-sm font-semibold opacity-90">Access your industrial dashboard.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Email */}
        <div className="space-y-2.5">
          <label className="block text-[0.8rem] font-bold text-slate-800 tracking-tight">
            Email Address
          </label>
          <div className="relative group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-400 transition-all duration-300 text-slate-900 placeholder-slate-500 font-bold text-sm"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-[0.8rem] font-bold text-slate-800 tracking-tight">
              Password
            </label>
            <button
              type="button"
              className="text-[0.75rem] text-blue-600 hover:text-blue-500 font-bold transition-colors tracking-tight"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-sm border border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-400 transition-all duration-300 text-slate-900 font-bold pr-12 text-sm"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-all duration-300"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me - Fully Clickable Area */}
        <div className="flex items-center">
          <label className="flex items-center space-x-3 cursor-pointer group w-full py-1">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-5 bg-white border-2 border-slate-300 rounded-lg transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-slate-400"></div>
              <svg
                className="absolute left-0 top-0 h-5 w-5 text-white pointer-events-none p-1 transition-all duration-200 peer-checked:opacity-100 opacity-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors select-none">Keep me signed in</span>
          </label>
        </div>

        {/* Error Message */}
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-100 rounded-2xl"
          >
            <p className="text-xs font-bold text-red-600 text-center">{localError}</p>
          </motion.div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full relative group overflow-hidden bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative flex items-center justify-center text-sm uppercase tracking-widest font-black">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing
              </>
            ) : (
              'Sign In'
            )}
          </span>
        </button>
      </form>
    </div>
  );
};

export default LoginForm;