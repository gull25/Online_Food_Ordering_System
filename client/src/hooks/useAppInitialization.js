import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from '../redux/authSlice';
import { setWishlist } from '../redux/wishlistSlice';
import { LOCAL_STORAGE_KEYS } from '../constants';
import api from '../api/axios';

export const useAppInitialization = () => {
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

  // Backend connection check
  useEffect(() => {
    api.get('/health').catch(() => {
      console.warn('Backend connection check failed.');
    });
  }, []);
};
