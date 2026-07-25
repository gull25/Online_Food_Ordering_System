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
  const { isAuthenticated, isInitialized, user } = useSelector(
    (state) => state.auth
  );

  const location = useLocation();

  // Still hydrating — show nothing to avoid a flash redirect.
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role !== 'restaurant_admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Intercept Restaurant Admins who don't have a restaurant
  if (user?.role === 'restaurant_admin') {
    const isApprovalPage = location.pathname === '/admin/onboarding';
    if (!user.restaurantId && !isApprovalPage) {
      return <Navigate to="/admin/onboarding" replace />;
    }
    // Also, if they DO have a restaurant and try to visit onboarding, bounce them to dashboard
    if (user.restaurantId && isApprovalPage) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <Outlet />;
};

export default AdminRoute;
