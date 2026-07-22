import { createSlice } from '@reduxjs/toolkit';

// isInitialized prevents AdminRoute / ProtectedRoute from making redirect
// decisions before App.jsx has had a chance to rehydrate Redux from localStorage.
const initialState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false, // <-- hydration guard
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called by App.jsx after reading localStorage — marks hydration complete.
    initializeAuth: (state, action) => {
      state.isInitialized = true;
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload;
      }
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.user = action.payload;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      // Keep isInitialized true — we know the user is now a guest.
    },
  },
});

export const { initializeAuth, loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
