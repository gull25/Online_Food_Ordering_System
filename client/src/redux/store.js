import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
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
  devTools: process.env.NODE_ENV !== 'production',
});
