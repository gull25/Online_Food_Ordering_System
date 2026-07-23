import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../features/auth/authSlice';
import { clearCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // adjust base URL according to your setup
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodoraToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Dispatch logout and clearCart to Redux store
      store.dispatch(logout());
      store.dispatch(clearCart());
      toast.error('Session expired. Please log in again.');
      // Optional: you could force a reload or navigate to /auth, 
      // but Redux state changes will re-render components appropriately.
    } else {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
      if (error.config.method !== 'get') {
        toast.error(errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
