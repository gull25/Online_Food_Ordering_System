import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { APP_ROUTES, USER_ROLES } from './constants';

import { ProtectedRoute, GuestRoute } from './ProtectedRoute';

import AdminLayout from './components/adminDashboardComponents/AdminLayout';
import RiderLayout from './components/riderDashboardComponents/RiderLayout';

import LoadingSkeleton from './components/common/LoadingSkeleton';

const HomeScreen = React.lazy(() => import('./screens/userScreens/HomeScreen'));
const AuthScreen = React.lazy(() => import('./screens/userScreens/AuthPage')); // To be split
const RestaurantDetailScreen = React.lazy(() => import('./screens/userScreens/RestaurantDetailScreen'));
const OffersScreen = React.lazy(() => import('./screens/userScreens/OffersScreen'));
const TrackOrderScreen = React.lazy(() => import('./screens/userScreens/TrackOrderScreen'));
const CheckoutScreen = React.lazy(() => import('./screens/userScreens/CheckoutScreen'));
const PaymentFailedScreen = React.lazy(() => import('./screens/userScreens/PaymentFailedScreen'));
const ProfileScreen = React.lazy(() => import('./screens/userScreens/ProfileScreen'));
const OrderHistoryScreen = React.lazy(() => import('./screens/userScreens/OrderHistoryScreen'));

const AdminDashboardPage = React.lazy(() => import('./screens/dashboard/admin/dashboard/AdminDashboardPage'));
const AdminOrdersPage = React.lazy(() => import('./screens/dashboard/admin/orders/AdminOrdersPage'));
const AdminMyRestaurantPage = React.lazy(() => import('./screens/dashboard/admin/restaurant/AdminMyRestaurantPage'));
const AdminCategoriesPage = React.lazy(() => import('./screens/dashboard/admin/categories/AdminCategoriesPage'));
const AdminOffersPage = React.lazy(() => import('./screens/dashboard/admin/offers/AdminOffersPage'));
const AdminProductsPage = React.lazy(() => import('./screens/dashboard/admin/products/AdminProductsPage'));
const AdminAnalyticsPage = React.lazy(() => import('./screens/dashboard/admin/analytics/AdminAnalyticsPage'));
const RestaurantOnboardingPage = React.lazy(() => import('./screens/dashboard/admin/restaurant/RestaurantOnboardingPage'));
const StripeReturnPage = React.lazy(() => import('./screens/dashboard/admin/dashboard/StripeReturnPage'));

const RiderDashboardPage = React.lazy(() => import('./screens/dashboard/rider/dashboard/RiderDashboard'));
const ActiveDeliveriesPage = React.lazy(() => import('./screens/dashboard/rider/deliveries/ActiveDeliveries'));
const EarningsPage = React.lazy(() => import('./screens/dashboard/rider/earnings/Earnings'));

const NotFoundPage = React.lazy(() => import('./screens/errorPages/NotFoundPage'));
const UnauthorizedPage = React.lazy(() => import('./screens/errorPages/UnauthorizedPage'));

const ConditionalRoutes = () => {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route path={APP_ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={APP_ROUTES.HOME} element={<HomeScreen />} />

        <Route element={<GuestRoute />}>
          <Route path={APP_ROUTES.AUTH} element={<AuthScreen />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/customer/dashboard" element={<HomeScreen />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailScreen />} />
          <Route path={APP_ROUTES.OFFERS} element={<OffersScreen />} />
          <Route path={APP_ROUTES.TRACK_ORDER} element={<TrackOrderScreen />} />
          <Route path={APP_ROUTES.ORDERS} element={<OrderHistoryScreen />} />
          <Route path={APP_ROUTES.CHECKOUT} element={<CheckoutScreen />} />
          <Route path="/payment-failed" element={<PaymentFailedScreen />} />
          <Route path={APP_ROUTES.PROFILE} element={<ProfileScreen />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.RESTAURANT_ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path={APP_ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={APP_ROUTES.ADMIN_ONBOARDING} element={<RestaurantOnboardingPage />} />
            <Route path={APP_ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
            <Route path={APP_ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
            <Route path={APP_ROUTES.ADMIN_RESTAURANT} element={<AdminMyRestaurantPage />} />
            <Route path={APP_ROUTES.ADMIN_CATEGORIES} element={<AdminCategoriesPage />} />
            <Route path={APP_ROUTES.ADMIN_OFFERS} element={<AdminOffersPage />} />
            <Route path={APP_ROUTES.ADMIN_PRODUCTS} element={<AdminProductsPage />} />
            <Route path={APP_ROUTES.ADMIN_STRIPE_RETURN} element={<StripeReturnPage />} />
            <Route path={APP_ROUTES.ADMIN_STRIPE_REFRESH} element={<StripeReturnPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.RIDER]} />}>
          <Route element={<RiderLayout />}>
            <Route path={APP_ROUTES.RIDER_DASHBOARD} element={<RiderDashboardPage />} />
            <Route path={APP_ROUTES.RIDER_DELIVERIES} element={<ActiveDeliveriesPage />} />
            <Route path={APP_ROUTES.RIDER_EARNINGS} element={<EarningsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </Suspense>
  );
};

export default ConditionalRoutes;
