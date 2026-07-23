import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import productReducer from '../features/products/productSlice';
import themeReducer from '../features/theme/themeSlice';
import orderReducer from '../features/orders/orderSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import userReducer from '../features/user/userSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import restaurantReducer from '../features/restaurants/restaurantSlice';
import menuReducer from '../features/menu/menuSlice';
import loadingReducer from '../features/loading/loadingSlice';
import adminReducer from '../features/admin/adminSlice';

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
  },
  devTools: process.env.NODE_ENV !== 'production',
});
