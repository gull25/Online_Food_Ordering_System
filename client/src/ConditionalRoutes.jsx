import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ── Route Guards ──────────────────────────────────────────────────────────────
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';

// ── Layouts ───────────────────────────────────────────────────────────────────
import AdminLayout from './components/adminDashboardComponents/AdminLayout';

// ── Loading Fallback ──────────────────────────────────────────────────────────
import LoadingSkeleton from './components/common/LoadingSkeleton';

// ── Lazy-loaded Pages ─────────────────────────────────────────────────────────
// Customer-facing (each page already renders its own Navbar internally)
const HomeScreen = React.lazy(() => import('./screens/userScreens/HomeScreen'));
const AuthScreen = React.lazy(() => import('./screens/userScreens/AuthPage')); // To be split
const RestaurantDetailScreen = React.lazy(() => import('./screens/userScreens/RestaurantDetailScreen'));
const OffersScreen = React.lazy(() => import('./screens/userScreens/OffersScreen'));
const TrackOrderScreen = React.lazy(() => import('./screens/userScreens/TrackOrderScreen'));
const CheckoutScreen = React.lazy(() => import('./screens/userScreens/CheckoutScreen'));
const ProfileScreen = React.lazy(() => import('./screens/userScreens/ProfileScreen'));

// Admin-facing
const AdminDashboardPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/dashboard/AdminDashboardPage'));
const AdminOrdersPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/orders/AdminOrdersPage'));
const AdminMyRestaurantPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/restaurant/AdminMyRestaurantPage'));
const AdminCategoriesPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/categories/AdminCategoriesPage'));
const AdminOffersPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/offers/AdminOffersPage'));
const AdminProductsPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/products/AdminProductsPage'));
const AdminAnalyticsPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/analytics/AdminAnalyticsPage'));
const RestaurantOnboardingPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/restaurant/RestaurantOnboardingPage'));
const StripeReturnPage = React.lazy(() => import('./screens/dashboard/AdminDashboard/dashboard/StripeReturnPage'));

// Rider-facing
const RiderDashboardPage = React.lazy(() => import('./screens/dashboard/UserDashboard/dashboard/RiderDashboard'));
const ActiveDeliveriesPage = React.lazy(() => import('./screens/dashboard/UserDashboard/deliveries/ActiveDeliveries'));
const EarningsPage = React.lazy(() => import('./screens/dashboard/UserDashboard/earnings/Earnings'));
const RatingsPage = React.lazy(() => import('./screens/dashboard/UserDashboard/ratings/Ratings'));

// Utility
const NotFoundPage = React.lazy(() => import('./screens/errorPages/NotFoundPage'));
const UnauthorizedPage = React.lazy(() => import('./screens/errorPages/UnauthorizedPage'));

// ── Route Tree ────────────────────────────────────────────────────────────────
const ConditionalRoutes = () => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>

        {/* ── Public Routes ─────────────────────────────────────────────── */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* TEMPORARY: Landing page moved out of GuestRoute so developers can view it while logged in */}
        <Route path="/" element={<HomeScreen />} />

        {/* ── Guest-only Routes (redirect authenticated users away) ──────── */}
        <Route element={<GuestRoute />}>
          <Route path="/auth" element={<AuthScreen />} />
        </Route>

        {/* ── Authenticated Customer Routes ─────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/customer/dashboard" element={<HomeScreen />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailScreen />} />
          <Route path="/offers" element={<OffersScreen />} />
          <Route path="/track-order" element={<TrackOrderScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>

        {/* ── Admin Routes (requires isAuthenticated + role === 'admin') ─── */}
        <Route element={<ProtectedRoute allowedRoles={['restaurant_admin']} />}>
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
        <Route element={<ProtectedRoute allowedRoles={['rider']} />}>
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

export default ConditionalRoutes;
