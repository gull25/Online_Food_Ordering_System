import { createSlice } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from '../constants/localStorageKeys';

/**
 * Auth state is rehydrated from localStorage *synchronously*, while the store is
 * being created — before React renders a single frame.
 *
 * This previously happened in an effect inside App.jsx, which meant the very
 * first render always had `isInitialized: false`. Route guards had nothing to
 * decide on yet, so they rendered a full-page loading skeleton on every cold
 * open — a wireframe flash before content that was already available locally.
 * Reading storage up front removes the indeterminate frame entirely.
 */
const readPersistedAuth = () => {
  try {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const userInfoString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_INFO);

    if (!token || !userInfoString) return null;

    const user = JSON.parse(userInfoString);
    // A stored blob without an id is corrupt — treat it as a signed-out state.
    if (!user || typeof user !== 'object' || !user._id) return null;

    return user;
  } catch {
    // Malformed JSON or storage blocked (private mode / disabled cookies).
    return null;
  }
};

const persistedUser = readPersistedAuth();

const initialState = {
  user: persistedUser,
  isAuthenticated: Boolean(persistedUser),
  // Hydration already happened above, so guards can decide on the first render.
  isInitialized: true,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Kept for explicit re-hydration (e.g. after a cross-tab storage event).
     * Passing `null` marks the user as a confirmed guest.
     */
    initializeAuth: (state, action) => {
      state.isInitialized = true;
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload;
      } else {
        state.isAuthenticated = false;
        state.user = null;
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
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    /** Merges partial updates (profile edits) without dropping other fields. */
    updateUser: (state, action) => {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_INFO, JSON.stringify(state.user));
      } catch {
        // Storage unavailable — in-memory state is still correct.
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Keep isInitialized true — we know the user is now a guest.
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
      } catch {
        // Nothing to clean up if storage is unavailable.
      }
    },
  },
});

export const {
  initializeAuth,
  loginStart,
  loginSuccess,
  loginFailure,
  updateUser,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
