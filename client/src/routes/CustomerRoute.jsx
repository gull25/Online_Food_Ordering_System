import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * CustomerRoute — guards routes that require authentication and customer role.
 * Waits for isInitialized before redirecting to prevent flash on page refresh.
 */
const CustomerRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role === 'restaurant_admin' || user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'rider') {
    return <Navigate to="/rider/dashboard" replace />;
  }

  return <Outlet />;
};

export default CustomerRoute;
