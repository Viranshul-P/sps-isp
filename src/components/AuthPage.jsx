// src/components/AuthPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient'; // <-- IMPORT SUPABASE
import styles from './AuthPage.module.css';
import Typewriter from './Typewriter';

// --- ANIMATED SYSTEM STATUS WIDGET (Unchanged) ---
const SystemStatusWidget = () => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    "// SECURE_CONNECTION: [ESTABLISHED]",
    "// AUTH_MODULE: [ONLINE]",
    "// AWAITING OPERATIVE INPUT...",
  ];
  const onTypeComplete = () => {
    setTimeout(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2000);
  };
  return (
    <div className={styles.systemStatusWidget}>
      <Typewriter
        key={statusIndex}
        text={statuses[statusIndex]}
        speed={30}
        onComplete={onTypeComplete}
      />
    </div>
  );
};

// --- MAIN AUTH PAGE COMPONENT ---
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [vaultPasskey, setVaultPasskey] = useState('');
  const [decoyPasskey, setDecoyPasskey] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- NEW SUPABASE SUBMIT LOGIC ---
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // --- Sign In Logic ---
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        if (error) throw error;
        navigate('/dashboard'); // Login success
      } else {
        // --- Sign Up ---
        if (vaultPasskey === decoyPasskey) {
          setError("// ERROR: Vault and Decoy passkeys must be different.");
          setLoading(false);
          return;
        }
        if (vaultPasskey.length < 4 || decoyPasskey.length < 4) {
          setError("// ERROR: Passkeys must be at least 4 characters.");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            // This data will be securely attached to the user
            // We will move it to the 'profiles' table with a trigger
            data: {
              real_vault_passkey: vaultPasskey,
              decoy_passkey: decoyPasskey
            }
          }
        });
        if (error) throw error;
        
        // No navigate on sign up. Show message:
        setError("// ENROLLMENT_PENDING: Please check your email for a confirmation link.");
        setIsLogin(true); // Flip back to login tab
      }
    } catch (err) {
      if (err.message) {
        setError(`// ERROR: ${err.message}`);
      } else {
        setError('// SYSTEM_ERROR: AUTHENTICATION_FAILED');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- NEW SUPABASE GOOGLE SIGN IN ---
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // This one line handles everything.
      // Supabase redirects to Google, then back to our app.
      // App.jsx will then handle the session.
      
      // --- THIS LINE IS NOW FIXED ---
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;

    } catch (err) {
      setError(`// ERROR: ${err.message}`);
      setLoading(false);
    }
    // No 'finally' loading(false) here, as the page will redirect.
  };

  return (
    <div className={styles.authContainer}>
      <SystemStatusWidget />
      
      <motion.div 
        className={styles.authPanel}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={styles.authToggle}>
          <button
            className={`${styles.toggleButton} ${isLogin ? styles.active : ''}`}
            onClick={() => setIsLogin(true)}
          >
            [CONFIRM IDENTITY]
          </button>
          <button
            className={`${styles.toggleButton} ${!isLogin ? styles.active : ''}`}
            onClick={() => setIsLogin(false)}
          >
            [ESTABLISH IDENTITY]
          </button>
        </div>

        <form className={styles.authForm} onSubmit={handleEmailSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>
              // OPERATIVE_ID
            </label>
            <input
              type="email"
              id="email"
              className={styles.authInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>
              // LOGIN_PASSKEY
            </label>
            <input
              type="password"
              id="password"
              className={styles.authInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />
          </div>

          <AnimatePresence>
            {!isLogin && (
              <motion.div
                className={styles.extraFields}
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className={styles.inputGroup}>
                  <label htmlFor="vaultPasskey" className={styles.inputLabel}>
                    // REAL_VAULT_PASSKEY
                  </label>
                  <input
                    type="password"
                    id="vaultPasskey"
                    className={styles.authInput}
                    value={vaultPasskey}
                    onChange={(e) => setVaultPasskey(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="decoyPasskey" className={styles.inputLabel}>
                    // DECOY_PASSKEY (Plausible Deniability)
                  </label>
                  <input
                    type="password"
                    id="decoyPasskey"
                    className={styles.authInput}
                    value={decoyPasskey}
                    onChange={(e) => setDecoyPasskey(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              className={styles.errorMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className={styles.authButton} 
            disabled={loading}
          >
            {loading 
              ? '[PROCESSING...]' 
              : (isLogin ? '[VERIFY_ID]' : '[ENROLL_OPERATIVE]')}
          </button>
        </form>

        <div className={styles.divider}>
          <span className={styles.dividerText}>OR</span>
        </div>

        <div className={styles.googleButtonWrapper}>
          <button 
            className={styles.googleButton} 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            [SIGN IN WITH GOOGLE]
          </button>
        </div>
      </motion.div>
    </div>
  );
}