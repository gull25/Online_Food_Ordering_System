import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

/**
 * Uses the shared `api` client rather than bare axios against a relative
 * `/api/...` path.*/
export const fetchRestaurantMenu = createAsyncThunk(
    'menu/fetchByRestaurant',
    async (restaurantId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/restaurants/${restaurantId}/menu`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
};

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        clearMenu: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRestaurantMenu.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload || [];
            })
            .addCase(fetchRestaurantMenu.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
