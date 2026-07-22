import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * GuestRoute — guards routes that should only be accessible when NOT logged in.
 * Waits for isInitialized before redirecting to prevent flash on page refresh.
 */
const GuestRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector(
    (state) => state.auth
  );

  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    // Admins go directly to their dashboard, customers go home.
    const redirectTo = user?.role === 'admin' ? '/admin' : '/';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
