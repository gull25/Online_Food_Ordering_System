import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSkeleton from './components/common/LoadingSkeleton';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location, message: 'Please log in.' }} replace />;
  }

  // If specific roles are required, check them
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);

  if (!isInitialized) return <LoadingSkeleton />;

  if (isAuthenticated) {
    if (user?.role === 'restaurant_admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'rider') return <Navigate to="/rider/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <Outlet />;
};
