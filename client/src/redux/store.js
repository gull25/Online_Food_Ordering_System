import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer, { persistCart } from './cartSlice';
import orderReducer from './orderSlice';
import wishlistReducer from './wishlistSlice';
import userReducer from './userSlice';
import restaurantReducer from './restaurantSlice';
import menuReducer from './menuSlice';
import adminReducer from './adminSlice';
import riderReducer from './riderSlice';

/*
 * Four reducers -- products, theme, notifications and loading -- were registered
 * here but no component read their state and nothing dispatched their actions.
 * Theme is owned by ThemeContext, and per-request loading is held locally by the
 * slices that actually fetch. They have been removed along with their files.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
    user: userReducer,
    restaurants: restaurantReducer,
    menu: menuReducer,
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
