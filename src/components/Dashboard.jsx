// src/components/Dashboard.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom'; // <--- ADDED THIS IMPORT
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';
import { supabase } from '../supabaseClient';
import SymbolMatchPuzzle from './SymbolMatchPuzzle';

// --- ICONS ---
const LockIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const UserIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const LogOutIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" /></svg>);
const PlusIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>);
const DownloadIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const FileIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>);
const GridIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const ListIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>);
const FolderIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>);
const EyeIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const DeleteIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const CloseIcon = () => (<svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);

// --- REAL VAULT MODAL ---
const SecretVaultModal = ({ show, onClose, user }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState('grid');

  const getFiles = useCallback(async () => {
    if (!user) return;
    setError("");
    const { data, error } = await supabase.storage
      .from("files") 
      .list(user.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

    if (error) {
      console.error("Error listing files:", error);
      setError("Could not list files.");
    } else {
      const filesWithMetadata = data
        .filter(file => file.name !== ".emptyFolderPlaceholder")
        .map(file => ({
          ...file,
          extension: file.name.split('.').pop().toLowerCase(),
          size: formatFileSize(file.metadata?.size || 0)
        }));
      setFiles(filesWithMetadata);
    }
  }, [user]);

  useEffect(() => {
    if (show) getFiles();
  }, [show, getFiles]);

  const handleUploadFile = async () => {
    if (!fileToUpload || !user) return;
    setUploading(true);
    setError("");
    const storagePath = `${user.id}/${fileToUpload.name}`;
    try {
      const { error } = await supabase.storage.from("files").upload(storagePath, fileToUpload);
      if (error) throw error;
      setFileToUpload(null);
      getFiles();
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(`Upload Failed: ${err.message}`);
    }
    setUploading(false);
  };

  const handleDeleteFile = async (fileName) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;
    if (!user) return;
    const storagePath = `${user.id}/${fileName}`;
    try {
      const { error } = await supabase.storage.from("files").remove([storagePath]);
      if (error) throw error;
      getFiles(); 
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(`Delete Failed: ${err.message}`);
    }
  };

  const handleViewFile = async (fileName) => {
    if (!user) return;
    const storagePath = `${user.id}/${fileName}`;
    try {
      const { data, error } = await supabase.storage.from("files").createSignedUrl(storagePath, 3600); 
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error("Error viewing file:", err);
      setError(`View Failed: ${err.message}`);
    }
  };

  const handleDownloadFile = async (fileName) => {
    if (!user) return;
    const storagePath = `${user.id}/${fileName}`;
    try {
      const { data, error } = await supabase.storage.from("files").download(storagePath);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      setError(`Download Failed: ${err.message}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (extension) => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    const docExts = ['pdf', 'doc', 'docx', 'txt'];
    if (imageExts.includes(extension)) return '🖼️';
    if (videoExts.includes(extension)) return '🎥';
    if (docExts.includes(extension)) return '📄';
    return '📎';
  };

  if (!show) return null;

  // Use Portal for Secret Vault too for safety
  return createPortal(
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
            <h2 className="vault-title">My Vault</h2>
            <span className="vault-file-count">({files.length} files)</span>
          </div>
          <div className="vault-header-right">
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><GridIcon /></button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><ListIcon /></button>
            </div>
            <button onClick={onClose} className="vault-close-btn"><CloseIcon /></button>
          </div>
        </header>
        <div className="vault-body">
          <div className="vault-upload-section">
            <input type="file" className="vault-file-input" onChange={(e) => setFileToUpload(e.target.files[0])} id="file-upload-input"/>
            <label htmlFor="file-upload-input" className="vault-upload-label"><PlusIcon /> Choose File</label>
            {fileToUpload && <span className="selected-file-name">{fileToUpload.name}</span>}
            <button onClick={handleUploadFile} className="btn btn-danger vault-upload-btn" disabled={uploading || !fileToUpload}>
              {uploading ? "UPLOADING..." : "UPLOAD"}
            </button>
          </div>
          {error && <p className="vault-error">{error}</p>}
          <div className={`vault-files-container ${viewMode}`}>
            {files.length === 0 ? (
              <div className="vault-empty-state">
                <FolderIcon /><p>Your vault is empty</p><span>Upload your first file to get started</span>
              </div>
            ) : (
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div 
                    key={file.id} className={`vault-file-card ${viewMode}`}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ scale: 1.02 }}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="file-icon-large">{getFileIcon(file.extension)}</div>
                        <div className="file-info"><div className="file-name" title={file.name}>{file.name}</div><div className="file-meta">{file.size}</div></div>
                        <div className="file-actions-grid">
                          <button className="action-btn view" onClick={() => handleViewFile(file.name)}><EyeIcon /></button>
                          <button className="action-btn" onClick={() => handleDownloadFile(file.name)}><DownloadIcon /></button>
                          <button className="action-btn delete" onClick={() => handleDeleteFile(file.name)}><DeleteIcon /></button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="file-icon-small">{getFileIcon(file.extension)}</div>
                        <div className="file-info-list"><div className="file-name" title={file.name}>{file.name}</div><div className="file-meta">{file.size}</div></div>
                        <div className="file-actions-list">
                          <button className="action-btn view" onClick={() => handleViewFile(file.name)}><EyeIcon /></button>
                          <button className="action-btn" onClick={() => handleDownloadFile(file.name)}><DownloadIcon /></button>
                          <button className="action-btn delete" onClick={() => handleDeleteFile(file.name)}><DeleteIcon /></button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// --- PASSKEY MODAL (FIXED WITH PORTAL) ---
const PasskeyModal = ({ show, onClose, onSuccess, onDecoy, user }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleAccess = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user) throw new Error("User not authenticated.");
      const { data, error: dbError } = await supabase.from("profiles").select("real_vault_passkey, decoy_passkey").eq("user_id", user.id).single(); 
      if (dbError) throw dbError;

      if (data) {
        if (passkey === data.real_vault_passkey) {
          setPasskey(''); setLoading(false); onSuccess(); return;
        } else if (passkey === data.decoy_passkey) {
          setPasskey(''); setLoading(false); onDecoy(); return;
        } else { setError("Incorrect Passkey."); }
      } else { setError("Error: No passkey data found for this user."); }
    } catch (err) {
      console.error("Passkey Check Error:", err);
      setError(`System Error: ${err.message}`);
    }
    setLoading(false);
  };

  // --- THE FIX IS HERE: createPortal moves this out of the dashboard hierarchy ---
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="passkey-modal-content"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3><LockIcon /> RESTRICTED ACCESS</h3>
        <p>This action requires a Level-5 passkey.</p>
        <input
          type="password"
          value={passkey}
          onChange={(e) => { setPasskey(e.target.value); setError(''); }}
          placeholder="Enter Passkey"
          className="vault-input"
          autoFocus
        />
        {error && <p className="vault-error">{error}</p>}
        <button onClick={handleAccess} className="btn btn-danger vault-button" disabled={loading}>
          {loading ? "CHECKING..." : "UNLOCK"}
        </button>
      </motion.div>
    </div>,
    document.body
  );
};

// --- DECOY VAULT MODAL ---
const DecoyVaultModal = ({ show, onClose }) => {
  const [logs, setLogs] = useState(["// System Initialized. Awaiting commands..."]);
  const logContainerRef = useRef(null);
  const fakeLogEntries = [
    "// Pinging secure node 1... 200 OK", "// Authenticating user token...", "// [CLASSIFIED] Token validated.",
    "// Accessing data stream 'PROJECT_CANARY'...", "// Decrypting package: 0x5A... 100%", "// WARNING: Unrecognized signature 0x8B detected.",
    "// Isolating potential threat...", "// Threat neutralized. Resuming operation.", "// Loading manifest 'OPERATION_NIGHTFALL'...", "// SYNC_COMPLETE. STANDING_BY...",
  ];

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
    if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
  }, [logs]);

  if (!show) return null;

  // Use Portal for Decoy too
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="vault-modal-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()} 
      >
        <header className="vault-header">
          <div className="vault-header-left"><FolderIcon /><h2 className="vault-title">Decoy Archive</h2><span className="vault-file-count">(LIVE LOG)</span></div>
          <div className="vault-header-right"><button onClick={onClose} className="vault-close-btn"><CloseIcon /></button></div>
        </header>
        <div className="vault-body">
          <div className="decoy-log-container" ref={logContainerRef}>
            {logs.map((log, index) => (<p key={index} className="decoy-log-line"><span className="decoy-log-prefix">&gt; </span>{log}</p>))}
          </div>
          <div className="vault-upload-section" style={{ marginTop: '1.5rem', opacity: 0.5, cursor: 'not-allowed' }}>
            <label className="vault-upload-label" style={{cursor: 'not-allowed'}}><PlusIcon /> Choose File</label>
            <span className="selected-file-name" style={{ fontStyle: 'italic' }}>// UPLOAD_SUBSYSTEM: [OFFLINE]</span>
            <button className="btn btn-danger vault-upload-btn" disabled>UPLOAD</button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// --- DASHBOARD PAGE ---
export default function Dashboard({ session }) {
  const [showVault, setShowVault] = useState(false); 
  const [showDecoyVault, setShowDecoyVault] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [puzzleFlash, setPuzzleFlash] = useState(false);
  
  const navigate = useNavigate();
  const user = session.user;

  useEffect(() => {
    const checkGoogleUser = async () => {
      if (user?.app_metadata?.provider === 'google') {
        const { data, error } = await supabase.from("profiles").select("real_vault_passkey").eq("user_id", user.id).single();
        if (error) console.error("Error checking profile:", error);
        if (data && data.real_vault_passkey === null) navigate('/create-passkeys');
      }
    };
    checkGoogleUser();
  }, [user, navigate]);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); navigate('/'); } catch (err) { console.error("Logout Error:", err); }
  };

  const handleDecoyUnlock = () => {
    console.log("DECOY PASSKEY ENTERED. FAKE VAULT ACTIVATED.");
    setShowPasskeyModal(false); setShowDecoyVault(true);
  };

  const handleAegisClick = () => {
    if (isPuzzleSolved) { setShowPasskeyModal(true); } else { setPuzzleFlash(true); }
  };

  return (
    <div className="page-container dashboard-page">
      <SecretVaultModal show={showVault} onClose={() => setShowVault(false)} user={user} />
      <DecoyVaultModal show={showDecoyVault} onClose={() => setShowDecoyVault(false)} />
      <PasskeyModal show={showPasskeyModal} onClose={() => setShowPasskeyModal(false)} onSuccess={() => { setShowPasskeyModal(false); setShowVault(true); }} onDecoy={handleDecoyUnlock} user={user} />

      <header className="header-dark">
        <nav className="container header-nav">
          <div className="header-title-dark">AEGIS Engineering Blog</div>
          <div className="header-links">
            <span className="user-email"><UserIcon /> <span>{user.email || 'Operative'}</span></span>
            <button onClick={handleLogout} className="logout-btn"><LogOutIcon /> <span>Logout</span></button>
          </div>
        </nav>
      </header>

      <main className="container article-main">
        <motion.div className="article-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h1>The Snowden Gambit: Asymmetric Data Warfare and its Aftermath</h1>
          <p className="article-meta">By Dr. Aris Thorne | Published: Nov 18, 2025 | Topic: Global Surveillance</p>
          <p>The 2013 revelations by Edward Snowden were not merely a leak; they were a paradigm shift in the public understanding of digital infrastructure. We learned that the systems we rely on for communication, commerce, and connection were simultaneously being used as the most powerful surveillance tools ever conceived.</p>
          <p>
            The core of the leak, a program known as <strong>PRISM</strong>, exposed a vast, classified data-mining operation. More critically, it highlighted the inherent vulnerability of centralized data. The challenge for modern security engineering is therefore twofold: not only must we protect data from unauthorized access, but we must also architect systems that are fundamentally resilient to compromised nodes. The <strong className="secret-trigger" onClick={handleAegisClick} title={isPuzzleSolved ? "Access Vault [LVL-5]" : "Solve decryption puzzle below to activate this node"}>AEGIS</strong> protocol, a decentralized and zero-knowledge framework, represents the vanguard of this new approach.
          </p>
          <blockquote>"To be truly secure, a system must not only protect its secrets, but also be able to plausibly deny their very existence."</blockquote>
          <p>Snowden's disclosures demonstrated that the greatest threat often comes from within. Insider threats, credential misuse, and leveraged access (as seen with programs like XKEYSCORE and MUSCULAR) render traditional perimeter defenses obsolete. The AEGIS protocol counters this by enforcing strict compartmentalization, where no single node—not even a system administrator—has the complete key to decrypt a user's vault.</p>
          
          <SymbolMatchPuzzle onSolve={() => setIsPuzzleSolved(true)} doFlash={puzzleFlash} onFlashComplete={() => setPuzzleFlash(false)} />
          
          <p>Implementing such a system is not without its hurdles. The computational overhead of zero-knowledge proofs and the complexities of decentralized key management are significant. However, the Snowden leaks provided a non-negotiable mandate: the cost of convenience can no longer be our privacy. The digital age demands a new digital shield, one forged in the fires of transparency and built on a foundation of verifiable trust.</p>
          <p>The ultimate lesson from the 'Snowden Gambit' is that data is a liability. The more you collect, the greater your attack surface. The only truly secure data is data you don't have. This is the philosophy behind AEGIS: build a system where we, the provider, have nothing to steal. The user, and only the user, holds the key.</p>
        </motion.div>
      </main>
    </div>
  );
}