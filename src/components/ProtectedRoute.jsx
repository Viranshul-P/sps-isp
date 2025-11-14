import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import './Dashboard.css'; // We can borrow the styles from Dashboard.css

// This component checks for auth status
export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is the Firebase "listener". It runs when the app loads
    // and whenever the user signs in or out.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty array ensures this runs only once on mount

  if (loading) {
    // Show a themed loading screen while we check credentials
    return (
      <div className="dashboardContainer loadingScreen">
        <h1 className="title">[CHECKING CREDENTIALS...]</h1>
      </div>
    );
  }

  if (!user) {
    // If loading is done and there's no user, redirect to login
    return <Navigate to="/auth" replace />;
  }

  // If loading is done and there IS a user, show the page
  return children;
}