import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css'; 
import DataVerse from './DataVerse'; 

// --- 1. Glitch-Free Typewriter (Unchanged) ---
const Typewriter = ({ text, delay = 0, onComplete, speed = 40 }) => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
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

// --- 2. Scroll-triggered Typewriter (Unchanged) ---
const TypewriterOnScroll = ({ text, delay = 0 }) => {
  const [hasStarted, setHasStarted] = useState(false);
  return (
    <motion.span
      onViewportEnter={() => setHasStarted(true)}
      viewport={{ once: true, amount: 0.8 }} 
    >
      {hasStarted ? <Typewriter text={text} delay={delay} /> : ''}
      {!hasStarted && <span className="type-cursor">_</span>}
    </motion.span>
  );
};

// --- ICONS ---
const ShieldIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);
const MapIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.806-.984A11.978 11.978 0 0110 2c-2.67 0-5.182 1.047-7.07 2.745M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
const KeyIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
);

// --- MAIN COMPONENT ---
export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, when: "beforeChildren" } 
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="page-container landing-page">
      <DataVerse />

      <div className="landing-foreground">
        
        {/* Header */}
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

        {/* Hero Section */}
        <main className="container hero-section">
          <h2 className="hero-title">
            <Typewriter text="PLAUSIBLE DENIABILITY SYSTEM" delay={800} />
          </h2>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.5 }}
          >
            Hide your data in plain sight. A secure file vault disguised as a 
            boring engineering blog. Even if you are forced to open it, 
            the decoy protects your real secrets.
          </motion.p>
          
          {/* NEW STANDARD BUTTON (No Scratch) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 3.0 }}
            style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}
          >
            <Link to="/auth" className="btn btn-primary btn-large">
              [ INITIALIZE ACCESS ]
            </Link>
          </motion.div>

          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 3.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <span className="scroll-text">// SCROLL_TO_LEARN_MORE</span>
            <svg className="scroll-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </motion.div>

          {/* Features Section - Updated Text */}
          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div className="feature-card" variants={itemVariants}>
              <ShieldIcon />
              <h3>THE DECOY INTERFACE</h3>
              <p>
                To the outside world, this is just an "AEGIS Engineering Blog." 
                Casual observers will see only technical articles and boring code snippets. 
                Your vault is completely invisible.
              </p> 
            </motion.div>
            
            <motion.div className="feature-card" variants={itemVariants}>
              <MapIcon />
              <h3>HIDDEN TRIGGER</h3>
              <p>
                There is no "Login" button on the dashboard. You must find the hidden 
                keyword buried within the article text. Only by clicking the correct 
                word and solving the security puzzle can you access the login.
              </p>
            </motion.div>

            <motion.div className="feature-card" variants={itemVariants}>
              <KeyIcon />
              <h3>DUAL PASSKEYS</h3>
              <p>
                Set two passkeys: "Real" and "Decoy." If coerced, enter the Decoy passkey 
                to open a fake, empty vault with simulated system logs. Your real files 
                remain undetected.
              </p>
            </motion.div>
          </motion.div>

          {/* Overview Section - Instructional Text */}
          <motion.section 
            className="overview-section"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1 }}
          >
            <h2 className="overview-title">
              <TypewriterOnScroll text="// OPERATIONAL_GUIDE: HOW_TO_ACCESS" />
            </h2>
            <p className="overview-text">
              <TypewriterOnScroll 
                text="This system is built on the principle of obscurity. Once you create an account, you will be redirected to the public-facing 'Engineering Blog.' Do not panic; this is the disguise." 
                delay={2000} 
              />
            </p> 
            <p className="overview-text">
              <TypewriterOnScroll 
                text="To access your files: 1. Read the article about 'The Snowden Gambit'. 2. Locate the highlighted keyword 'AEGIS' in the text. 3. Click it to trigger the Memory Matrix puzzle. 4. Solve the puzzle to reveal the passkey entry terminal."
                delay={6000} 
              />
            </p>
            <p className="overview-text" style={{ color: '#f472b6', marginTop: '1rem' }}>
              <TypewriterOnScroll 
                text="WARNING: If you are being watched, enter your DECOY PASSKEY. The system will load a fake environment to satisfy your adversary while keeping your actual data safe."
                delay={12000} 
              />
            </p>
          </motion.section>

        </main>
      </div>
    </div>
  );
}