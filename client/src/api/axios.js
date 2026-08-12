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


api.interceptors.response.use(
  (response) => response,
  async (error) => {

    if (axios.isCancel?.(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;


      store?.dispatch(logout());
      store?.dispatch(clearCart());


      toast.error('Session expired. Please log in again.');
      return Promise.reject(error);
    }


    if (!error.response) {
      if (originalRequest?.method && originalRequest.method !== 'get') {
        toast.error('Network error — please check your connection and try again.');
      }
      return Promise.reject(error);
    }


    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    if (originalRequest?.method && originalRequest.method !== 'get') {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;
