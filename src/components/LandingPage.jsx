import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingPage.css'; // Import CSS
import DataVerse from './DataVerse'; // Corrected import path

// --- 1. Glitch-Free Typewriter (Strict Mode Safe) ---
const Typewriter = ({ text, delay = 0, onComplete, speed = 40 }) => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true); // Fixed array destructuring

  const index = useRef(0);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    index.current = 0;
    setTypedText('');
    setShowCursor(true);

    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (index.current < text.length) {
          setTypedText((prev) => text.substring(0, index.current + 1));
          index.current += 1;
        } else {
          clearInterval(intervalRef.current);
          setShowCursor(false);
          if (onComplete) onComplete();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, [text, delay, onComplete, speed]);

  return (
    <>
      <span className="inline">{typedText}</span>
      {showCursor && <span className="type-cursor">_</span>}
    </>
  );
};


// --- 2. Scroll-triggered Typewriter ---
const TypewriterOnScroll = ({ text, delay = 0 }) => {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <motion.span
      onViewportEnter={() => {
        setHasStarted(true);
      }}
      viewport={{ once: true, amount: 0.8 }} 
    >
      {hasStarted ? (
        <Typewriter 
          text={text} 
          delay={delay} 
        />
      ) : (
        '' 
      )}
      {!hasStarted && <span className="type-cursor">_</span>}
    </motion.span>
  );
};


// --- 3. Scratch-to-Reveal Component (Enhanced with Mobile Support) ---
const ScratchToReveal = ({ children }) => {
  const [revealedPixels, setRevealedPixels] = useState(new Set());
  const [isScratching, setIsScratching] = useState(false);
  const longPressTimerRef = useRef(null);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const revealThreshold = 0.4; 

  const getPixelKey = (x, y) => `${Math.floor(x / 10)}-${Math.floor(y / 10)}`;

  // Mouse handlers (desktop)
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsScratching(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRevealedPixels(prev => new Set(prev).add(getPixelKey(x, y)));
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isScratching || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPixels = new Set(revealedPixels);
    for (let i = -10; i <= 10; i += 5) {
      for (let j = -10; j <= 10; j += 5) {
        newPixels.add(getPixelKey(x + i, y + j));
      }
    }
    setRevealedPixels(newPixels);
  }, [isScratching, revealedPixels]);

  const handleMouseUp = useCallback(() => {
    setIsScratching(false);
  }, []);

  // Touch handlers (mobile)
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Start long press timer (3 seconds)
      longPressTimerRef.current = setTimeout(() => {
        // Reveal all pixels on long press
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const totalPixelsX = Math.floor(rect.width / 10);
          const totalPixelsY = Math.floor(rect.height / 10);
          const allPixels = new Set();
          
          for (let i = 0; i < totalPixelsX; i++) {
            for (let j = 0; j < totalPixelsY; j++) {
              allPixels.add(`${i}-${j}`);
            }
          }
          setRevealedPixels(allPixels);
          setIsScratching(false);
        }
      }, 3000);
      
      setIsScratching(true);
      setRevealedPixels(prev => new Set(prev).add(getPixelKey(x, y)));
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!isScratching || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const newPixels = new Set(revealedPixels);
    for (let i = -10; i <= 10; i += 5) {
      for (let j = -10; j <= 10; j += 5) {
        newPixels.add(getPixelKey(x + i, y + j));
      }
    }
    setRevealedPixels(newPixels);
  }, [isScratching, revealedPixels]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    setIsScratching(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleMouseUp]);

  const totalPixels = useRef(0);
  useEffect(() => {
    if (containerRef.current && overlayRef.current && totalPixels.current === 0) {
      const rect = containerRef.current.getBoundingClientRect();
      totalPixels.current = Math.floor(rect.width / 10) * Math.floor(rect.height / 10);
    }
  }, []); 

  const isFullyRevealed = revealedPixels.size / totalPixels.current > revealThreshold;

  return (
    <div 
      ref={containerRef}
      className="scratch-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {!isFullyRevealed && (
          <motion.div 
            ref={overlayRef}
            className="scratch-overlay"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="scratch-text">[SCRATCH]</span>
            <span className="scratch-subtext">
              {window.innerWidth <= 768 
                ? "Long press (3s) or drag to decrypt" 
                : "Click and drag to decrypt"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`scratch-content ${isFullyRevealed ? 'visible' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

// --- ICONS (Unchanged) ---
const ShieldIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const LockIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const EyeIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-1.49 1.49" /></svg>
);

// --- Main Landing Page Component ---
export default function LandingPage() {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        when: "beforeChildren"
      } 
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="page-container landing-page">

      {/* --- 3D BACKGROUND ADDED --- */}
      <DataVerse />

      {/* --- FOREGROUND WRAPPER ADDED --- */}
      <div className="landing-foreground">
        
        {/* Header/Menubar (Your code, unchanged) */}
        <motion.header 
          className="header container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="header-title">
            <Typewriter text="[SECRET VAULT]" />
          </h1>
        </motion.header>

        {/* Hero Section (Your code, unchanged) */}
        <main className="container hero-section">
          <h2 className="hero-title">
            <Typewriter text="SYSTEM_ACCESS: [UNAUTHORIZED]" delay={800} />
          </h2>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.5 }}
          >
            This is a restricted-access system. All data is classified, 
            encrypted, and subject to zero-knowledge protocols. 
            Unauthorized access is strictly prohibited.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 3.0 }}
            className="scratch-button-wrapper"
          >
            <ScratchToReveal>
              <Link to="/auth" className="btn btn-primary btn-large">
                [AUTHENTICATE]
              </Link>
            </ScratchToReveal>
          </motion.div>

          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <span className="scroll-text">// SCROLL_FOR_INTEL</span>
            <svg className="scroll-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </motion.div>

          {/* Features Section with Scroll Animations (Your code, unchanged) */}
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div className="feature-card" variants={itemVariants}>
              <ShieldIcon />
              <h3>ZERO-KNOWLEDGE PROTOCOL</h3>
              <p>
                All encryption and decryption occurs client-side.
                We have no access to your keys or data. Ever.
              </p> 
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <LockIcon />
              <h3>AES-256 ENCRYPTION</h3>
              <p>
                Data is secured using industry-standard symmetric 
                encryption before transmission from your device.
              </p>
            </motion.div>

            <motion.div className="feature-card" variants={itemVariants}>
              <EyeIcon />
              <h3>DENIABLE STORAGE</h3>
              <p>
                Vaults are hidden within a decoy system.
                Plausible deniability is maintained at all times.
              </p>
            </motion.div>
          </motion.div>

          {/* Added Text Section with Scroll Animation (Your code, unchanged) */}
          <motion.section 
            className="overview-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1 }}
          >
            <h2 className="overview-title">
              <TypewriterOnScroll text="// PROJECT_OVERVIEW: DIRECTIVE_7" />
            </h2>
            <p className="overview-text">
              <TypewriterOnScroll 
                text="This system provides a secure, anonymous, and deniable communication and storage layer for authorized government operatives. Its purpose is to safeguard national security assets and sensitive intelligence from all forms of digital and physical compromise. By leveraging a zero-knowledge architecture, we ensure that only the end-user has access to their data. All operations are compartmentalized and logged on a write-only ledger, ensuring a chain of custody while maintaining operative anonymity." 
                delay={2000} // Start typing after title
              />
            </p> 
            <p className="overview-text">
              <TypewriterOnScroll 
                text="Access is granted on a per-need basis. All connections are monitored. Misuse of this system will result in immediate termination of access and investigation. Your identity is your first line of defense. Protect it."
                delay={10000} // Start typing after first paragraph
              />
            </p>
          </motion.section>

        </main>
      </div> {/* --- END OF FOREGROUND WRAPPER --- */}
    </div>
  );
}