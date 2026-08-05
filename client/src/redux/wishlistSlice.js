import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

export const toggleFavoriteThunk = createAsyncThunk(
  'wishlist/toggleFavorite',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const { default: api } = await import('../api/axios');
      const response = await api.put(`/users/favorites/${restaurantId}`);
      // Update local storage so it persists across refreshes
      const userInfoString = localStorage.getItem('userInfo');
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        userInfo.favorites = response.data.data;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
      return response.data.data; // This returns the updated favorites array
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
      return rejectWithValue(error.response?.data?.message || 'Failed to update wishlist');
    }
  }
);

const initialState = {
  items: [], // Will store array of restaurant ObjectIds
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    clearWishlist: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleFavoriteThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFavoriteThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(toggleFavoriteThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
