import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from './redux/authSlice';
import { setWishlist } from './redux/wishlistSlice';
import ConditionalRoutes from './ConditionalRoutes';
import api from './api/axios';
import { Toaster } from 'react-hot-toast';
import { LOCAL_STORAGE_KEYS } from './constants';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const userInfoString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_INFO);

    if (token && userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        dispatch(initializeAuth(userInfo));
        if (userInfo && userInfo.favorites) {
          dispatch(setWishlist(userInfo.favorites));
        }
      } catch {
        dispatch(initializeAuth(null));
      }
    } else {
      dispatch(initializeAuth(null));
    }

    api.get('/status').catch(() => {
      console.warn('Backend connection check failed.');
    });
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'font-body text-small' }} />
      <ConditionalRoutes />
    </>
  );
}

export default App;