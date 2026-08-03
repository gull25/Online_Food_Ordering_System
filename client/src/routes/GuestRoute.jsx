import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

/**
 * GuestRoute — guards routes that should only be accessible when NOT logged in.
 * Waits for isInitialized before redirecting to prevent flash on page refresh.
 */
const GuestRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);

  if (!isInitialized) return <LoadingSkeleton />;

  if (isAuthenticated) {
    if (user?.role === 'restaurant_admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'rider') return <Navigate to="/rider/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
