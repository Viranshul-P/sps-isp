// src/components/CreatePasskeys.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient'; // <-- IMPORT SUPABASE
import './Dashboard.css'; // We re-use the styles from Dashboard.css

// --- ICONS (INLINE) ---
const LockIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const UserIcon = () => (
  <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

export default function CreatePasskeys() {
  const [vaultPasskey, setVaultPasskey] = useState('');
  const [decoyPasskey, setDecoyPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

    try {
      // 1. Get the currently logged-in user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        navigate('/auth'); // Not logged in, send to auth
        return;
      }
      
      // 2. Save the passkeys to their new document
      // We UPDATE the 'profiles' row that our trigger already created.
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          real_vault_passkey: vaultPasskey,
          decoy_passkey: decoyPasskey
        })
        .eq("user_id", user.id); // Find the row where user_id matches

      if (updateError) throw updateError;

      // 3. All done, send to the real dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError("Error saving passkeys. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboardContainer loadingScreen"> {/* Re-using styles */}
      <motion.div
        className="passkey-modal-content" // Re-using styles
        style={{ maxWidth: '40rem' }} // A bit wider
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit}>
          <h3><UserIcon /> One Last Step, Operative</h3>
          <p>
            Welcome. Your Google account is authenticated.
            Please set the passkeys for your new vault.
          </p>
          
          <div className="input-group-passkey"> {/* New class */}
            <label>// REAL_VAULT_PASSKEY</label>
            <input
              type="password"
              value={vaultPasskey}
              onChange={(e) => setVaultPasskey(e.target.value)}
              placeholder="Your secret passkey"
              className="vault-input"
              required
            />
          </div>

          <div className="input-group-passkey"> {/* New class */}
            <label>// DECOY_PASSKEY</label>
            <input
              type="password"
              value={decoyPasskey}
              onChange={(e) => setDecoyPasskey(e.target.value)}
              placeholder="Your 'plausible deniability' passkey"
              className="vault-input"
              required
            />
          </div>

          {error && <p className="vault-error">{error}</p>}
          <button
            type="submit"
            className="btn btn-danger vault-button"
            disabled={loading}
          >
            {loading ? "SAVING..." : "SET PASSKEYS & ENTER VAULT"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}