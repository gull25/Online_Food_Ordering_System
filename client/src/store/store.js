import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';
import restaurantReducer from '../features/restaurant/restaurantSlice';
import productReducer from '../features/products/productSlice';
import themeReducer from '../features/theme/themeSlice';
import orderReducer from '../features/orders/orderSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';
import userReducer from '../features/user/userSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import loadingReducer from '../features/loading/loadingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    restaurant: restaurantReducer,
    products: productReducer,
    theme: themeReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
    user: userReducer,
    notifications: notificationReducer,
    loading: loadingReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
