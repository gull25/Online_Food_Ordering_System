import axios from 'axios';
import { logout } from '../redux/authSlice';
import { clearCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';
import { LOCAL_STORAGE_KEYS } from '../constants/localStorageKeys';

let store;
export const injectStore = (_store) => {
  store = _store;
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // A cancelled request is not a failure — never surface it to the user.
    if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      // The token is gone or invalid: clear both the store and the persisted
      // session so a stale token can't be replayed on the next request.
      store?.dispatch(logout());
      store?.dispatch(clearCart());

      // Guests hitting a protected endpoint get a redirect from the route
      // guards; only warn users who actually had a session to lose.
      toast.error('Session expired. Please log in again.');
      return Promise.reject(error);
    }

    // Network-level failure (backend down, DNS, offline) has no response body.
    if (!error.response) {
      if (originalRequest?.method && originalRequest.method !== 'get') {
        toast.error('Network error — please check your connection and try again.');
      }
      return Promise.reject(error);
    }

    // Only surface errors for state-changing requests. A failed background GET
    // is handled by the calling screen's own error state.
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    if (originalRequest?.method && originalRequest.method !== 'get') {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;
