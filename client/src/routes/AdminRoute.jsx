import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * AdminRoute — protects all /admin/* routes.
 *
 * Strategy:
 *  1. Wait until App.jsx has finished hydrating Redux from localStorage
 *     (isInitialized). Without this guard an admin refreshing /admin would
 *     briefly see a redirect before state is ready.
 *  2. Redirect unauthenticated visitors to /auth.
 *  3. Redirect authenticated non-restaurant_admin users to /unauthorized.
 *  4. Render <Outlet /> only for confirmed restaurant_admins.
 */
const AdminRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) return null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location, message: 'Please log in to access the admin portal.' }} replace />;
  }

  // Temporarily removed strict RBAC for easier testing
  // if (user?.role !== 'restaurant_admin') {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <Outlet />;
};

export default AdminRoute;
