import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ── Route Guards ──────────────────────────────────────────────────────────────
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import GuestRoute from './GuestRoute';

// ── Layouts ───────────────────────────────────────────────────────────────────
import AdminLayout from '../layouts/AdminLayout';

// ── Loading Fallback ──────────────────────────────────────────────────────────
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// ── Lazy-loaded Pages ─────────────────────────────────────────────────────────
// Customer-facing (each page already renders its own Navbar internally)
const HomePage             = React.lazy(() => import('../pages/Home/HomePage'));
const AuthPage             = React.lazy(() => import('../pages/Auth/AuthPage'));
const RestaurantDetailPage = React.lazy(() => import('../pages/RestaurantDetails/RestaurantDetailPage'));
const OffersPage           = React.lazy(() => import('../pages/Offers/OffersPage'));
const TrackOrderPage       = React.lazy(() => import('../pages/Orders/TrackOrderPage'));
const CheckoutPage         = React.lazy(() => import('../pages/Checkout/CheckoutPage'));

// Admin-facing
const AdminDashboardPage   = React.lazy(() => import('../pages/Admin/AdminDashboardPage'));
const AdminOrdersPage      = React.lazy(() => import('../pages/Admin/AdminOrdersPage'));
const AdminRestaurantsPage = React.lazy(() => import('../pages/Admin/AdminRestaurantsPage'));
const AdminAnalyticsPage   = React.lazy(() => import('../pages/Admin/AdminAnalyticsPage'));

// Utility
const NotFoundPage         = React.lazy(() => import('../pages/NotFound/NotFoundPage'));
const UnauthorizedPage     = React.lazy(() => import('../pages/Unauthorized/UnauthorizedPage'));

// ── Route Tree ────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>

        {/* ── Public Routes ─────────────────────────────────────────────── */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
        <Route path="/offers"         element={<OffersPage />} />
        <Route path="/unauthorized"   element={<UnauthorizedPage />} />

        {/* ── Guest-only Routes (redirect authenticated users away) ──────── */}
        <Route element={<GuestRoute />}>
          <Route path="/auth"         element={<AuthPage />} />
        </Route>

        {/* ── Authenticated Customer Routes ─────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/track-order"  element={<TrackOrderPage />} />
          <Route path="/checkout"     element={<CheckoutPage />} />
        </Route>

        {/* ── Admin Routes (requires isAuthenticated + role === 'admin') ─── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"               element={<AdminDashboardPage />} />
            <Route path="/admin/orders"        element={<AdminOrdersPage />} />
            <Route path="/admin/restaurants"   element={<AdminRestaurantsPage />} />
            <Route path="/admin/analytics"     element={<AdminAnalyticsPage />} />
          </Route>
        </Route>

        {/* ── 404 Catch-all ─────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
