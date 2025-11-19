import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import './Dashboard.css'; // We re-use all the styles

// --- Icons (re-used from Dashboard) ---
const CloseIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const FolderIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
);

// --- NEW: Decryption Puzzle Component ---
const DecoyPuzzle = () => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [puzzleState, setPuzzleState] = useState('idle'); // 'idle', 'playing', 'failed', 'solved'
  const [activeButton, setActiveButton] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);

  const sequenceLevel = 4; // The puzzle will be 4 steps long

  // --- Puzzle Logic ---
  const generateRandomCode = () => {
    const hex = () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0');
    return `[AUTH_CODE: ${hex()}${hex()}-${hex()}${hex()}-${hex()}${hex()}-${hex()}${hex()}]`;
  };

  const playSequence = async () => {
    setPuzzleState('playing');
    setPlayerSequence([]);
    
    // Generate a new sequence
    let newSequence = [];
    for (let i = 0; i < sequenceLevel; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSequence);

    // "Play" the sequence to the user
    await new Promise(res => setTimeout(res, 1000)); // Wait 1s
    for (let val of newSequence) {
      setActiveButton(val);
      await new Promise(res => setTimeout(res, 500)); // Button flash duration
      setActiveButton(null);
      await new Promise(res => setTimeout(res, 200)); // Pause between flashes
    }
    setPuzzleState('listening');
  };

  const handlePlayerClick = (index) => {
    if (puzzleState !== 'listening') return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    // Check if the click was correct
    if (sequence[newPlayerSequence.length - 1] !== index) {
      setPuzzleState('failed');
      return;
    }

    // Check if the sequence is complete
    if (newPlayerSequence.length === sequence.length) {
      setPuzzleState('solved');
      setGeneratedCode(generateRandomCode());
    }
  };

  const getStatusMessage = () => {
    switch (puzzleState) {
      case 'idle':
        return 'System locked. Awaiting decryption...';
      case 'playing':
        return 'Replicating security sequence... Watch closely.';
      case 'listening':
        return 'Your turn. Replicate the sequence.';
      case 'failed':
        return 'Sequence mismatch. Security protocol re-engaged.';
      case 'solved':
        return 'Decryption successful. Access key generated:';
      default:
        return '';
    }
  };

  return (
    <div className="decoy-puzzle-container">
      <h4 className="puzzle-title">// Bypass Security Protocol</h4>
      
      {/* The 4 puzzle buttons */}
      <div className="puzzle-button-grid">
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            className={`puzzle-btn ${activeButton === i ? 'active' : ''}`}
            onClick={() => handlePlayerClick(i)}
            disabled={puzzleState !== 'listening'}
          />
        ))}
      </div>
      
      <p className="puzzle-status-message">{getStatusMessage()}</p>

      {/* Show the fake code when solved */}
      {puzzleState === 'solved' && (
        <p className="puzzle-solved-code">{generatedCode}</p>
      )}

      {/* The Start/Retry Button */}
      {puzzleState !== 'playing' && puzzleState !== 'listening' && (
        <button className="puzzle-start-btn" onClick={playSequence}>
          {puzzleState === 'idle' ? '[START DECRYPTION]' : '[RE-TRY SEQUENCE]'}
        </button>
      )}
    </div>
  );
};

// --- Fake Log (Unchanged) ---
const fakeLogEntries = [
  "// Pinging secure node 1... 200 OK",
  "// Authenticating user token...",
  "// [CLASSIFIED] Token validated.",
  "// Accessing data stream 'PROJECT_CANARY'...",
  "// Decrypting package: 0x5A... 100%",
  "// WARNING: Unrecognized signature 0x8B detected.",
  "// Isolating potential threat...",
  "// Threat neutralized. Resuming operation.",
  "// Loading manifest 'OPERATION_NIGHTFALL'...",
  "// SYNC_COMPLETE. STANDING_BY...",
];

export const DecoyVaultModal = ({ show, onClose }) => {
  const [logs, setLogs] = useState(["// System Initialized. Awaiting commands..."]);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (show) {
      const interval = setInterval(() => {
        setLogs(prevLogs => {
          const nextLog = fakeLogEntries[prevLogs.length % fakeLogEntries.length];
          return [...prevLogs, nextLog];
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [show]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="vault-modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()} 
      >
        <header className="vault-header">
          <div className="vault-header-left">
            <FolderIcon />
            <h2 className="vault-title">Decoy Archive</h2>
            <span className="vault-file-count">(LIVE LOG)</span>
          </div>
          <div className="vault-header-right">
            <button onClick={onClose} className="vault-close-btn">
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="vault-body">
          {/* This is the fake terminal log */}
          <div className="decoy-log-container" ref={logContainerRef}>
            {logs.map((log, index) => (
              <p key={index} className="decoy-log-line">
                <span className="decoy-log-prefix">&gt; </span>{log}
              </p>
            ))}
          </div>
          
          {/* --- REPLACED UPLOAD SECTION WITH PUZZLE --- */}
          <DecoyPuzzle />
        </div>
      </motion.div>
    </div>
  );
};

// Default export for easier dynamic import (if needed)
export default DecoyVaultModal;