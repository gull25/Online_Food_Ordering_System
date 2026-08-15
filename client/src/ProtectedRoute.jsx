import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { APP_ROUTES, USER_ROLES } from './constants';
import RouteProgress from './components/common/RouteProgress';


export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) return <RouteProgress />;

  if (!isAuthenticated) {
   
    return (
      <Navigate
        to={APP_ROUTES.AUTH}
        state={{ from: location, message: 'Please log in to continue.' }}
        replace
      />
    );
  }

  // If specific roles are required, check them
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to={APP_ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

/** Keeps signed-in users off the auth screen, routing them to their home surface. */
export const GuestRoute = () => {
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth);

  if (!isInitialized) return <RouteProgress />;

  if (isAuthenticated) {
    if (user?.role === USER_ROLES.RESTAURANT_ADMIN) {
      return <Navigate to={APP_ROUTES.ADMIN_DASHBOARD} replace />;
    }
    if (user?.role === USER_ROLES.RIDER) {
      return <Navigate to={APP_ROUTES.RIDER_DASHBOARD} replace />;
    }
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  return <Outlet />;
};
