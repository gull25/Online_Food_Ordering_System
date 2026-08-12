import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './redux/authSlice';
import { setWishlist } from './redux/wishlistSlice';
import ConditionalRoutes from './ConditionalRoutes';
import api from './api/axios';
import { Toaster } from 'react-hot-toast';
import { LOCAL_STORAGE_KEYS } from './constants';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Auth itself is rehydrated synchronously when the store is built (see
  // authSlice), so there is no loading gate here. This only seeds the derived
  // wishlist state from the already-hydrated user.
  useEffect(() => {
    if (user?.favorites) {
      dispatch(setWishlist(user.favorites));
    }
  }, [dispatch, user]);

  // Keep sessions consistent across tabs: signing out in one tab should not
  // leave another tab holding a stale authenticated view.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== LOCAL_STORAGE_KEYS.TOKEN) return;

      if (!event.newValue) {
        dispatch(initializeAuth(null));
        return;
      }

      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_INFO);
        if (stored) dispatch(initializeAuth(JSON.parse(stored)));
      } catch {
        dispatch(initializeAuth(null));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [dispatch]);

  useEffect(() => {
    api.get('/health').catch(() => {
      console.warn('Backend connection check failed.');
    });
  }, []);

  return (
    <>
      {/*
        Targets the `#main-content` landmark that the screens render. Placed
        first in the DOM so it is the very first thing focus reaches.
      */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          className: 'font-body text-small',
          style: {
            background: 'var(--color-surface-container-lowest)',
            color: 'var(--color-on-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
            padding: '12px 16px',
            maxWidth: '420px',
          },
          success: { iconTheme: { primary: 'var(--color-tertiary)', secondary: '#fff' } },
          error: { iconTheme: { primary: 'var(--color-error)', secondary: '#fff' } },
        }}
      />
      <ConditionalRoutes />
    </>
  );
}

export default App;
