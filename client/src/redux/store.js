import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer, { persistCart } from './cartSlice';
import productReducer from './productSlice';
import themeReducer from './themeSlice';
import orderReducer from './orderSlice';
import wishlistReducer from './wishlistSlice';
import userReducer from './userSlice';
import notificationReducer from './notificationSlice';
import restaurantReducer from './restaurantSlice';
import menuReducer from './menuSlice';
import loadingReducer from './loadingSlice';
import adminReducer from './adminSlice';
import riderReducer from './riderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer,
    theme: themeReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
    user: userReducer,
    notifications: notificationReducer,
    restaurants: restaurantReducer,
    menu: menuReducer,
    loading: loadingReducer,
    admin: adminReducer,
    rider: riderReducer,
  },
  devTools: import.meta.env.DEV,
});

/**
 * Persist the cart on every change.
 *
 * Without this a page refresh silently emptied the cart — a user who reloaded
 * mid-checkout lost everything they had selected. Only the cart slice is
 * persisted; auth has its own storage and the rest is server-derived.
 */
let lastCartState = store.getState().cart;
store.subscribe(() => {
  const cartState = store.getState().cart;
  if (cartState === lastCartState) return;
  lastCartState = cartState;
  persistCart(cartState);
});
