import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from './features/auth/authSlice';
import AppRoutes from './routes/AppRoutes';
import api from './api/axios';
import { Toaster } from 'react-hot-toast';

// Root React component — hydrates auth state from localStorage then renders routes.
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt to restore auth session from localStorage.
    // initializeAuth sets isInitialized=true in both branches so route guards
    // can safely make redirect decisions after this runs.
    const token = localStorage.getItem('foodoraToken');
    const userInfoString = localStorage.getItem('userInfo');

    if (token && userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        dispatch(initializeAuth(userInfo));
      } catch {
        // Corrupted data — treat as guest but mark initialization done.
        dispatch(initializeAuth(null));
      }
    } else {
      dispatch(initializeAuth(null));
    }

    // Optional: verify backend connectivity.
    api.get('/status').catch(() => {
      console.warn('Backend connection check failed.');
    });
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'font-body text-small' }} />
      <AppRoutes />
    </>
  );
}

export default App;