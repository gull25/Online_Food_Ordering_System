export const APP_ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  OFFERS: '/offers',
  TRACK_ORDER: '/track-order',
  ORDERS: '/orders',
  CHECKOUT: '/checkout',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  RESTAURANT_DETAIL: (id) => `/restaurant/${id}`,
  
  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ONBOARDING: '/admin/onboarding',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_RESTAURANT: '/admin/my-restaurant',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_OFFERS: '/admin/offers',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_STRIPE_RETURN: '/admin/stripe/return',
  ADMIN_STRIPE_REFRESH: '/admin/stripe/refresh',
  
  // Rider Routes
  RIDER_DASHBOARD: '/rider/dashboard',
  RIDER_DELIVERIES: '/rider/active-deliveries',
  RIDER_EARNINGS: '/rider/earnings',
};
