// src/App.jsx

import React, { useState, useEffect } from 'react';
// --- NEW IMPORTS ---
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './supabaseClient';

import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import CreatePasskeys from './components/CreatePasskeys';

// This component protects your dashboard
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// --- Enhanced Classified Loading Screen ---
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-content">
      <div className="loading-header">
        <div className="classified-badge">CLASSIFIED</div>
        <h1 className="loading-title">
          <span className="loading-prefix">[</span>
          CHECKING CREDENTIALS
          <span className="loading-suffix">]</span>
        </h1>
      </div>
      <div className="loading-progress">
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className="loading-status">
        <span className="status-line">// VERIFYING_IDENTITY</span>
        <span className="status-line">// ESTABLISHING_SECURE_CONNECTION</span>
        <span className="status-line">// LOADING_SYSTEM_MODULES</span>
      </div>
    </div>
  </div>
);

function App() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = !!session;
  
  // --- NEW HOOKS FOR REDIRECT ---
  const navigate = useNavigate();
  const location = useLocation();
  // ------------------------------

  // --- SUPABASE AUTH LISTENER (Unchanged) ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- !!! NEW REDIRECT LOGIC !!! ---
  // This hook watches for changes in login state or location
  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn && (location.pathname === '/' || location.pathname === '/auth')) {
        // You are LOGGED IN but on the landing/auth page.
        // We must send you to the dashboard.
        navigate('/dashboard');
      }
      if (!isLoggedIn && (location.pathname === '/dashboard' || location.pathname === '/create-passkeys')) {
        // You are LOGGED OUT but on a protected page.
        // We must send you to the auth page.
        navigate('/auth');
      }
    }
  }, [isLoggedIn, isLoading, location.pathname, navigate]);
  // --- END OF NEW LOGIC ---

  const pageTransition = {
    initial: { opacity: 0, x: "-50px" },
    animate: { opacity: 1, x: "0px" },
    exit: { opacity: 0, x: "50px" }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      <div className="scanline-overlay" />
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/" 
            element={
              <motion.div key="landing" {...pageTransition}>
                <LandingPage />
              </motion.div>
            } 
          />
          <Route 
            path="/auth" 
            element={
              <motion.div key="auth" {...pageTransition}>
                <AuthPage />
              </motion.div>
            } 
          />
          <Route 
            path="/create-passkeys" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <motion.div key="create-passkeys" {...pageTransition}>
                  <CreatePasskeys />
                </motion.div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <motion.div key="dashboard" {...pageTransition}>
                  <Dashboard session={session} />
                </motion.div>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;