import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * RiderRoute — protects all /rider/* routes.
 */
const RiderRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'rider') {
    if (user?.role === 'restaurant_admin' || user?.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RiderRoute;
