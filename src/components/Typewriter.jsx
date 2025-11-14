import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css'; // Uses the .type-cursor style

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

export default Typewriter;