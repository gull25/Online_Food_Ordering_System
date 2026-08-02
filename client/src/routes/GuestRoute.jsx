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
  const { isAuthenticated, isInitialized, user } = useSelector(
    (state) => state.auth
  );
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (user?.role === 'admin' || user?.role === 'restaurant_admin') {
      setRedirectPath('/admin');
    } else if (user?.role === 'rider') {
      setRedirectPath('/rider/dashboard');
    } else {
      setRedirectPath('/');
    }
  }, [isAuthenticated, user]);

  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    if (!redirectPath) {
      return <LoadingSkeleton />;
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
