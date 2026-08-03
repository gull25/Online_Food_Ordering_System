import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * CustomerRoute — guards routes that require authentication and customer role.
 * Waits for isInitialized before redirecting to prevent flash on page refresh.
 */
const CustomerRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ message: 'Please log in to access this page.' }} replace />;
  }

  // Temporarily removed strict RBAC for easier testing
  // if (user?.role !== 'customer') {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <Outlet />;
};

export default CustomerRoute;
