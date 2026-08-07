import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Async thunks
export const fetchFeaturedRestaurants = createAsyncThunk(
    'restaurants/fetchFeatured',
    async (params, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams({ featured: 'true' });
            if (params?.lat && params?.lng) {
                query.set('lat', params.lat);
                query.set('lng', params.lng);
            }
            const response = await api.get(`/restaurants?${query.toString()}`);
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

/**
 * List and detail track their own loading/error state.
 *
 * They previously shared one `loading` flag, so a detail fetch resolving would
 * flip the featured list out of its loading state (and vice versa) — the two
 * requests raced and whichever finished last dictated both spinners. Splitting
 * them means each surface reflects only its own request.
 */
const initialState = {
    featuredRestaurants: [],
    currentRestaurant: null,
    listLoading: false,
    listError: null,
    detailLoading: false,
    detailError: null,
    userLocation: null, // { lat, lng }
};

const restaurantSlice = createSlice({
    name: 'restaurants',
    initialState,
    reducers: {
        clearCurrentRestaurant: (state) => {
            state.currentRestaurant = null;
            state.detailError = null;
        },
        setUserLocation: (state, action) => {
            state.userLocation = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Featured
            .addCase(fetchFeaturedRestaurants.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchFeaturedRestaurants.fulfilled, (state, action) => {
                state.listLoading = false;
                state.featuredRestaurants = action.payload || [];
            })
            .addCase(fetchFeaturedRestaurants.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload;
            })
            // Fetch Details
            .addCase(fetchRestaurantDetails.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.currentRestaurant = action.payload || null;
            })
            .addCase(fetchRestaurantDetails.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload;
                state.currentRestaurant = null;
            });
    },
});

export const { clearCurrentRestaurant, setUserLocation } = restaurantSlice.actions;
export default restaurantSlice.reducer;
