import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  restaurants: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
};

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setRestaurants: (state, action) => {
      state.restaurants = action.payload;
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
});

export const { setRestaurants, setSelectedRestaurant, setLoading, setError } = restaurantSlice.actions;
export default restaurantSlice.reducer;
