import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Async thunks
export const fetchFeaturedRestaurants = createAsyncThunk(
    'restaurants/fetchFeatured',
    async (params, { rejectWithValue }) => {
        try {
            let url = '/restaurants?featured=true';
            if (params && params.lat && params.lng) {
                url += `&lat=${params.lat}&lng=${params.lng}`;
            }
            const response = await api.get(url);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured restaurants');
        }
    }
);

export const fetchRestaurantDetails = createAsyncThunk(
    'restaurants/fetchDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/restaurants/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant details');
        }
    }
);

const initialState = {
    featuredRestaurants: [],
    currentRestaurant: null,
    loading: false,
    error: null,
    userLocation: null, // { lat, lng }
};

const restaurantSlice = createSlice({
    name: 'restaurants',
    initialState,
    reducers: {
        clearCurrentRestaurant: (state) => {
            state.currentRestaurant = null;
        },
        setUserLocation: (state, action) => {
            state.userLocation = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Featured
            .addCase(fetchFeaturedRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFeaturedRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.featuredRestaurants = action.payload || [];
            })
            .addCase(fetchFeaturedRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Details
            .addCase(fetchRestaurantDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentRestaurant = action.payload || null;
            })
            .addCase(fetchRestaurantDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentRestaurant, setUserLocation } = restaurantSlice.actions;
export default restaurantSlice.reducer;
