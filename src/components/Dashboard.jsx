// src/components/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';
import { supabase } from '../supabaseClient'; // <-- IMPORT SUPABASE
import NodePuzzler from './NodePuzzler';

// --- ICONS (INLINE) ---
const LockIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const UserIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const LogOutIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H3" /></svg>
);
const PlusIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>
);
const DownloadIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
);
const FileIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
);
const GridIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const ListIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
);
const FolderIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
);
const EyeIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const DeleteIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const CloseIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);


// --- *REAL* VAULT MODAL (Enhanced Google Drive Style) ---
const SecretVaultModal = ({ show, onClose, user }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedFile, setSelectedFile] = useState(null);

  // 1. Get files from Supabase Storage
  const getFiles = useCallback(async () => {
    if (!user) return;
    setError("");
    // List all files in a folder named after the user's ID
    const { data, error } = await supabase.storage
      .from("files") // Our new bucket
      .list(user.id, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Error listing files:", error);
      setError("Could not list files.");
    } else {
      // Filter out the placeholder file Supabase creates in an empty folder
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

  // Get files when modal is shown
  useEffect(() => {
    if (show) {
      getFiles();
    }
  }, [show, getFiles]);

  // 2. Handle File Upload
  const handleUploadFile = async () => {
    if (!fileToUpload || !user) return;
    setUploading(true);
    setError("");

    // Files will be at path: /files/{user_id}/{filename}
    const storagePath = `${user.id}/${fileToUpload.name}`;

    try {
      const { error } = await supabase.storage
        .from("files")
        .upload(storagePath, fileToUpload);
      
      if (error) throw error;
      
      // Success! Refresh the list
      setFileToUpload(null);
      getFiles();

    } catch (err) {
      console.error("Error uploading file:", err);
      setError(`Upload Failed: ${err.message}`);
    }
    setUploading(false);
  };

  // 3. Handle File Delete
  const handleDeleteFile = async (fileName) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;
    if (!user) return;

    const storagePath = `${user.id}/${fileName}`;
    try {
      const { error } = await supabase.storage
        .from("files")
        .remove([storagePath]);

      if (error) throw error;
      getFiles(); // Refresh list

    } catch (err) {
      console.error("Error deleting file:", err);
      setError(`Delete Failed: ${err.message}`);
    }
  };

  // 4. Handle File View/Preview
  const handleViewFile = async (fileName) => {
    if (!user) return;
    const storagePath = `${user.id}/${fileName}`;
    try {
      // Create a signed URL that expires in 1 hour (for private buckets)
      const { data, error } = await supabase.storage
        .from("files")
        .createSignedUrl(storagePath, 3600); // 3600 seconds = 1 hour
      
      if (error) throw error;
      
      if (data?.signedUrl) {
        // Open the signed URL in new tab
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error("Error viewing file:", err);
      setError(`View Failed: ${err.message}`);
    }
  };

  // 5. Handle File Download
  const handleDownloadFile = async (fileName) => {
    if (!user) return;
    const storagePath = `${user.id}/${fileName}`;
    try {
      const { data, error } = await supabase.storage
        .from("files")
        .download(storagePath);
      
      if (error) throw error;

      // Create a temporary link to download the file
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

  // Helper: Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Helper: Get file icon based on extension
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
            <h2 className="vault-title">My Vault</h2>
            <span className="vault-file-count">({files.length} files)</span>
          </div>
          <div className="vault-header-right">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <GridIcon />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <ListIcon />
              </button>
            </div>
            <button onClick={onClose} className="vault-close-btn">
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="vault-body">
          <div className="vault-upload-section">
            <input 
              type="file" 
              className="vault-file-input"
              onChange={(e) => setFileToUpload(e.target.files[0])}
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="vault-upload-label">
              <PlusIcon /> Choose File
            </label>
            {fileToUpload && (
              <span className="selected-file-name">{fileToUpload.name}</span>
            )}
            <button 
              onClick={handleUploadFile}
              className="btn btn-danger vault-upload-btn"
              disabled={uploading || !fileToUpload}
            >
              {uploading ? "UPLOADING..." : "UPLOAD"}
            </button>
          </div>

          {error && <p className="vault-error">{error}</p>}
          
          <div className={`vault-files-container ${viewMode}`}>
            {files.length === 0 ? (
              <div className="vault-empty-state">
                <FolderIcon />
                <p>Your vault is empty</p>
                <span>Upload your first file to get started</span>
              </div>
            ) : (
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div 
                    key={file.id} 
                    className={`vault-file-card ${viewMode}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="file-icon-large">
                          {getFileIcon(file.extension)}
                        </div>
                        <div className="file-info">
                          <div className="file-name" title={file.name}>{file.name}</div>
                          <div className="file-meta">{file.size}</div>
                        </div>
                        <div className="file-actions-grid">
                          <button className="action-btn view" onClick={() => handleViewFile(file.name)} title="View">
                            <EyeIcon />
                          </button>
                          <button className="action-btn" onClick={() => handleDownloadFile(file.name)} title="Download">
                            <DownloadIcon />
                          </button>
                          <button className="action-btn delete" onClick={() => handleDeleteFile(file.name)} title="Delete">
                            <DeleteIcon />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="file-icon-small">
                          {getFileIcon(file.extension)}
                        </div>
                        <div className="file-info-list">
                          <div className="file-name" title={file.name}>{file.name}</div>
                          <div className="file-meta">{file.size}</div>
                        </div>
                        <div className="file-actions-list">
                          <button className="action-btn view" onClick={() => handleViewFile(file.name)} title="View">
                            <EyeIcon />
                          </button>
                          <button className="action-btn" onClick={() => handleDownloadFile(file.name)} title="Download">
                            <DownloadIcon />
                          </button>
                          <button className="action-btn delete" onClick={() => handleDeleteFile(file.name)} title="Delete">
                            <DeleteIcon />
                          </button>
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
    </div>
  );
};


// --- *PASSKEY* MODAL (Migrated) ---
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

      // Fetch passkeys from our 'profiles' table
      const { data, error: dbError } = await supabase
        .from("profiles")
        .select("real_vault_passkey, decoy_passkey")
        .eq("user_id", user.id)
        .single(); // We only expect one row

      if (dbError) throw dbError;

      if (data) {
        if (passkey === data.real_vault_passkey) {
          // --- REAL PASSKEY ---
          setPasskey('');
          setLoading(false);
          onSuccess(); 
          return;
        } else if (passkey === data.decoy_passkey) {
          // --- DECOY PASSKEY ---
          setPasskey('');
          setLoading(false);
          onDecoy(); 
          return;
        } else {
          // --- WRONG PASSKEY ---
          setError("Incorrect Passkey.");
        }
      } else {
        setError("Error: No passkey data found for this user.");
      }
    } catch (err) {
      console.error("Passkey Check Error:", err);
      setError(`System Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
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
        />
        {error && <p className="vault-error">{error}</p>}
        <button
          onClick={handleAccess}
          className="btn btn-danger vault-button"
          disabled={loading}
        >
          {loading ? "CHECKING..." : "UNLOCK"}
        </button>
      </motion.div>
    </div>
  );
};


// --- DECOY ARTICLE PAGE (Migrated) ---
export default function Dashboard({ session }) { // <-- Receives session from App.jsx
  const [showVault, setShowVault] = useState(false); 
  const [showPasskeyModal, setShowPasskeyModal] = useState(false); 
  const navigate = useNavigate();
  const user = session.user; // Get user from session

  // --- NEW: Check if Google User needs to set passkeys ---
  useEffect(() => {
    const checkGoogleUser = async () => {
      // Check if user is from Google
      if (user?.app_metadata?.provider === 'google') {
        // Check if they have passkeys set in the 'profiles' table
        const { data, error } = await supabase
          .from("profiles")
          .select("real_vault_passkey")
          .eq("user_id", user.id)
          .single();

        if (error) console.error("Error checking profile:", error);

        // If data exists but the passkey is NULL, they need to create them
        if (data && data.real_vault_passkey === null) {
          navigate('/create-passkeys');
        }
      }
    };
    checkGoogleUser();
  }, [user, navigate]);

  // --- NEW: Supabase Logout ---
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/'); // Navigate to home, App.jsx will redirect to /auth
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const handleDecoyUnlock = () => {
    console.log("DECOY PASSKEY ENTERED. FAKE VAULT ACTIVATED.");
    setShowPasskeyModal(false);
  };

  return (
    <div className="page-container dashboard-page">
      
      <SecretVaultModal 
        show={showVault} 
        onClose={() => setShowVault(false)} 
        user={user} // Pass user to modal
      />

      <PasskeyModal
        show={showPasskeyModal}
        onClose={() => setShowPasskeyModal(false)}
        onSuccess={() => { 
          setShowPasskeyModal(false); 
          setShowVault(true); 
        }}
        onDecoy={handleDecoyUnlock} 
        user={user} // Pass user to modal
      />

      {/* Header */}
      <header className="header-dark">
        <nav className="container header-nav">
          <div className="header-title-dark">AEGIS Engineering Blog</div>
          <div className="header-links">
            <span className="user-email">
              <UserIcon /> <span>{user.email || 'Operative'}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="logout-btn"
            >
              <LogOutIcon /> <span>Logout</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Decoy Article */}
      <main className="container article-main">
        <motion.div 
          className="article-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>The Digital Frontier: Securing Modern Infrastructures</h1>
          <p className="article-meta">
            By Dr. Aris Thorne | Published: Nov 10, 2025 | Topic: Cybersecurity
          </p>
          <p>
            In an era of unprecedented digital connectivity, the security of our core infrastructures
            has become the paramount concern...
          </p>
          <blockquote>
            "The digital age demands a digital shield. We are building that shield."
          </blockquote>
          
          <NodePuzzler />
          
          <p>
            The challenge lies not only in defense but in resilience...
          </p>
          <p>
            The <strong 
              className="secret-trigger"
              onClick={() => setShowPasskeyModal(true)}
            >
              AEGIS
            </strong> protocol represents the vanguard of this new approach...
          </p>
          <p>
            Implementing such a system is not without its hurdles...
          </p>

        </motion.div>
      </main>
    </div>
  );
}