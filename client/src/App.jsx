import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import api from './api/axios';
import HomePage from './pages/Home/HomePage';
import AuthPage from './pages/Auth/AuthPage';
import RestaurantDetailPage from './pages/RestaurantDetails/RestaurantDetailPage';
import OffersPage from './pages/Offers/OffersPage';
import TrackOrderPage from './pages/Orders/TrackOrderPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminOrdersPage from './pages/Admin/AdminOrdersPage';
import AdminRestaurantsPage from './pages/Admin/AdminRestaurantsPage';
import AdminMenuPage from './pages/Admin/AdminMenuPage';
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage';

function App() {
  const [status, setStatus] = useState('Loading backend status...');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/status');
        setStatus(`Backend Connected! DB: ${response.data.db}`);
      } catch (error) {
        console.error('Error connecting to backend:', error);
        setStatus('Backend Connection Failed!');
      }
    };

    checkStatus();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Routes>
    </>
  );
}

export default App;


//Root React component containing the application's layout and routing