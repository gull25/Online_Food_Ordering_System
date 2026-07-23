import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SuperAdminRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector(
    (state) => state.auth
  );

  if (!isInitialized) return null;

  if (!isAuthenticated) return <Navigate to="/auth" replace />;

  if (user?.role !== 'super_admin' && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default SuperAdminRoute;
