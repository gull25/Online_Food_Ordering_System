import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ── Route Guards ──────────────────────────────────────────────────────────────
import CustomerRoute from './CustomerRoute';
import AdminRoute from './AdminRoute';
import GuestRoute from './GuestRoute';
import RiderRoute from './RiderRoute';
// ── Layouts ───────────────────────────────────────────────────────────────────
import AdminLayout from '../layouts/AdminLayout';

// ── Loading Fallback ──────────────────────────────────────────────────────────
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// ── Lazy-loaded Pages ─────────────────────────────────────────────────────────
// Customer-facing (each page already renders its own Navbar internally)
const HomePage = React.lazy(() => import('../pages/Home/HomePage'));
const AuthPage = React.lazy(() => import('../pages/Auth/AuthPage'));
const RestaurantDetailPage = React.lazy(() => import('../pages/RestaurantDetails/RestaurantDetailPage'));
const OffersPage = React.lazy(() => import('../pages/Offers/OffersPage'));
const TrackOrderPage = React.lazy(() => import('../pages/Orders/TrackOrderPage'));
const CheckoutPage = React.lazy(() => import('../pages/Checkout/CheckoutPage'));
const ProfilePage = React.lazy(() => import('../pages/Profile/ProfilePage'));

// Admin-facing
const AdminDashboardPage = React.lazy(() => import('../pages/Admin/AdminDashboardPage'));
const AdminOrdersPage = React.lazy(() => import('../pages/Admin/AdminOrdersPage'));
const AdminMyRestaurantPage = React.lazy(() => import('../pages/Admin/AdminMyRestaurantPage'));
const AdminCategoriesPage = React.lazy(() => import('../pages/Admin/AdminCategoriesPage'));
const AdminOffersPage = React.lazy(() => import('../pages/Admin/AdminOffersPage'));
const AdminProductsPage = React.lazy(() => import('../pages/Admin/AdminProductsPage'));
const AdminAnalyticsPage = React.lazy(() => import('../pages/Admin/AdminAnalyticsPage'));
const RestaurantOnboardingPage = React.lazy(() => import('../pages/Admin/RestaurantOnboardingPage'));
const StripeReturnPage = React.lazy(() => import('../pages/Admin/StripeReturnPage'));

// Rider-facing
const RiderDashboardPage = React.lazy(() => import('../pages/Rider/RiderDashboard'));
const ActiveDeliveriesPage = React.lazy(() => import('../pages/Rider/ActiveDeliveries'));
const EarningsPage = React.lazy(() => import('../pages/Rider/Earnings'));
const RatingsPage = React.lazy(() => import('../pages/Rider/Ratings'));

// Utility
const NotFoundPage = React.lazy(() => import('../pages/NotFound/NotFoundPage'));
const UnauthorizedPage = React.lazy(() => import('../pages/Unauthorized/UnauthorizedPage'));

// ── Route Tree ────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>

        {/* ── Public Routes ─────────────────────────────────────────────── */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* TEMPORARY: Landing page moved out of GuestRoute so developers can view it while logged in */}
        <Route path="/" element={<HomePage />} />

        {/* ── Guest-only Routes (redirect authenticated users away) ──────── */}
        <Route element={<GuestRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* ── Authenticated Customer Routes ─────────────────────────────── */}
        <Route element={<CustomerRoute />}>
          <Route path="/customer/dashboard" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* ── Admin Routes (requires isAuthenticated + role === 'admin') ─── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/onboarding" element={<RestaurantOnboardingPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/my-restaurant" element={<AdminMyRestaurantPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/offers" element={<AdminOffersPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/stripe/return" element={<StripeReturnPage />} />
            <Route path="/admin/stripe/refresh" element={<StripeReturnPage />} />
          </Route>
        </Route>

        {/* ── Rider Routes (requires isAuthenticated + role === 'rider') ─── */}
        <Route element={<RiderRoute />}>
          <Route path="/rider/dashboard" element={<RiderDashboardPage />} />
          <Route path="/rider/active-deliveries" element={<ActiveDeliveriesPage />} />
          <Route path="/rider/earnings" element={<EarningsPage />} />
          <Route path="/rider/ratings" element={<RatingsPage />} />
        </Route>

        {/* ── 404 Catch-all ─────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
