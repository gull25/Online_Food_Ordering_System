import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * AdminRoute — protects all /admin/* routes.
 *
 * Strategy:
 *  1. Wait until App.jsx has finished hydrating Redux from localStorage
 *     (isInitialized). Without this guard an admin refreshing /admin would
 *     briefly see a redirect before state is ready.
 *  2. Redirect unauthenticated visitors to /auth.
 *  3. Redirect authenticated non-admin users to /unauthorized.
 *  4. Render <Outlet /> only for confirmed admins.
 */
const AdminRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector(
    (state) => state.auth
  );

  // Still hydrating — show nothing to avoid a flash redirect.
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
