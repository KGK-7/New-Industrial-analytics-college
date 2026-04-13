import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DotLottiePlayer } from '@dotlottie/react-player';
import LoginForm from '../components/LoginForm';

// Modern easing curves for a premium feel
const transitionEasing = [0.22, 1, 0.36, 1];

const Login = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginStart = () => {
    setIsAuthenticating(true);
  };

  const handleLoginSuccess = () => {
    // Navigate immediately or with a very short micro-transition
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex text-slate-900 overflow-hidden relative font-sans bg-slate-50">
      {/* 
        ========================================
        1. PREMIUM UNIFIED BACKGROUND
        ========================================
      */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(241,245,249,1),rgba(255,255,255,1))]" />

        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-500/5 to-transparent blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-indigo-500/5 to-transparent blur-[120px]"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Subtle Technical Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="premium-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="1.5" fill="currentColor" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#premium-grid)" />
          </svg>
        </div>
      </div>

      {/* ENTRANCE LOADER */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="initial-loader"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.5, ease: transitionEasing }}
          >
            <div className="w-64 h-64">
              <DotLottiePlayer
                src="/Office%20work.lottie"
                autoplay
                loop
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN LAYOUT */}
      {!loading && (
        <div className="flex-1 flex flex-col lg:flex-row w-full h-full min-h-screen relative z-10 max-w-7xl mx-auto">

          {/* LEFT SIDE: BRANDING & HIGHLIGHTS */}
          <div className="hidden lg:flex flex-[1.2] relative flex-col justify-center px-12 xl:px-16 overflow-hidden">
            <motion.div
              className="relative z-10 w-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: transitionEasing }}
            >
              <h1 className="text-6xl xl:text-[5.5rem] font-black tracking-tight leading-[1.05] mb-8 text-slate-900">
                <span className="block">Empower Your</span>
                <span className="block opacity-80">Industrial Data.</span>
              </h1>

              <p className="text-slate-700 text-lg xl:text-xl leading-relaxed max-w-xl font-medium mb-12">
                Professional tool provides centralized master management, dashboards and analytics for your industrial needs.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-4">
                {[
                  { title: "Track Every Project", desc: "Follow your project progress and details in a simple, clear dashboard." },
                  { title: "Handle Your Budgets", desc: "Upload and check your project budgets without any complicated steps." },
                  { title: "Organize Your Meetings", desc: "Keep your meeting notes and action items in one spot for the whole team." }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                  >
                    <div className="mt-1 h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-slate-800 font-bold text-sm leading-tight">{feature.title}</h3>
                      <p className="text-slate-600 text-xs font-semibold">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Subtle Abstract Illustration */}
            <div className="absolute bottom-[-10%] right-[-5%] w-3/4 h-3/4 opacity-[0.03] pointer-events-none">
              <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M 200 40 C 300 40 360 100 360 200 C 360 300 300 360 200 360 C 100 360 40 300 40 200 C 40 100 100 40 200 40" stroke="currentColor" strokeWidth="0.5" />
                <path d="M 200 80 C 280 80 320 120 320 200 C 320 280 280 320 200 320 C 120 320 80 280 80 200 C 80 120 120 80 200 80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
                <path d="M 200 0 L 200 400 M 0 200 L 400 200" stroke="currentColor" strokeWidth="0.2" />
              </svg>
            </div>
          </div>

          {/* RIGHT SIDE: LOGIN FORM */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 relative">
            <motion.div
              className="w-full max-w-[440px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: transitionEasing }}
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 rounded-[2.5rem] blur-2xl opacity-40 transition duration-1000 group-hover:duration-200 pointer-events-none" />
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/80 p-10 sm:p-12 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(15,23,42,0.05)] z-10">
                  <LoginForm onLoginStart={handleLoginStart} onLoginSuccess={handleLoginSuccess} />
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-12 left-0 right-0 text-center">
              <div className="flex flex-col items-center space-y-2 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <p className="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-slate-800">
                  Industrial Analytics Platform
                </p>
                <p className="text-[0.6rem] font-semibold text-slate-600">
                  © 2026 Powered by Caldim Engineering Pvt. Ltd.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aurora text gradient style */}
      <style>{`
        @keyframes aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .aurora-text {
          background: linear-gradient(-45deg, #2563eb, #4f46e5, #7c3aed, #4338ca, #2563eb);
          background-size: 300% auto;
          color: #1e293b;
          background-clip: text;
          text-fill-color: transparent;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: aurora 12s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;