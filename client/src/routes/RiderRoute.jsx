import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * RiderRoute — protects all /rider/* routes.
 */
const RiderRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location, message: 'Please log in to access the rider portal.' }} replace />;
  }

  // Temporarily removed strict RBAC for easier testing
  // if (user?.role !== 'rider') {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <Outlet />;
};

export default RiderRoute;
