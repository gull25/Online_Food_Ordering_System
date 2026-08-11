import { APP_ROUTES, USER_ROLES } from '../constants';

export const ADMIN_SIDEBAR_LINKS = [
  { id: 'dashboard', label: 'Dashboard', path: APP_ROUTES.ADMIN_DASHBOARD, icon: 'dashboard', roles: [] }, // Empty roles = all admin types
  { id: 'orders', label: 'Orders', path: APP_ROUTES.ADMIN_ORDERS, icon: 'receipt_long', roles: [] },
  { id: 'my-restaurant', label: 'My Restaurant', path: APP_ROUTES.ADMIN_RESTAURANT, icon: 'storefront', roles: [USER_ROLES.RESTAURANT_ADMIN] },
  { id: 'categories', label: 'Categories', path: APP_ROUTES.ADMIN_CATEGORIES, icon: 'category', roles: [USER_ROLES.RESTAURANT_ADMIN] },
  { id: 'offers', label: 'Offers', path: APP_ROUTES.ADMIN_OFFERS, icon: 'local_offer', roles: [USER_ROLES.RESTAURANT_ADMIN] },
  { id: 'products', label: 'Products', path: APP_ROUTES.ADMIN_PRODUCTS, icon: 'fastfood', roles: [USER_ROLES.RESTAURANT_ADMIN] }
];

/**
 * Single source of truth for rider navigation — the desktop sidebar and the
 * mobile bottom bar both render from this list, so they can't disagree about
 * which destinations exist. `shortLabel` is what the narrow bottom bar shows.
 */
export const RIDER_SIDEBAR_LINKS = [
  { id: 'dashboard', label: 'Overview', shortLabel: 'Home', path: APP_ROUTES.RIDER_DASHBOARD, icon: 'dashboard' },
  { id: 'active-deliveries', label: 'Active Deliveries', shortLabel: 'Tasks', path: APP_ROUTES.RIDER_DELIVERIES, icon: 'local_shipping' },
  { id: 'earnings', label: 'Earnings', shortLabel: 'Earnings', path: APP_ROUTES.RIDER_EARNINGS, icon: 'account_balance_wallet' }
];
