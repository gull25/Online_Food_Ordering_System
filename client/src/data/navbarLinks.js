import { APP_ROUTES } from '../constants';

export const NAVBAR_LINKS = [
  { label: 'Home', path: APP_ROUTES.HOME, requiresAuth: false, hideWhenAuth: true },
  { label: 'Restaurants', path: null, isDropdown: true },
  { label: 'Offers', path: APP_ROUTES.OFFERS, requiresAuth: true },
  { label: 'Track Order', path: APP_ROUTES.TRACK_ORDER, requiresAuth: true }
];
