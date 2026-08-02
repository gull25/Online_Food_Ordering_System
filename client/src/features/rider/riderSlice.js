import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const fetchRiderProfileThunk = createAsyncThunk(
    'rider/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/rider/me');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch rider profile');
        }
    }
);

export const fetchDashboardThunk = createAsyncThunk(
    'rider/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/rider/dashboard');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard summary');
        }
    }
);

export const fetchActiveOrderThunk = createAsyncThunk(
    'rider/fetchActiveOrder',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/rider/active');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch active order');
        }
    }
);

export const updateRiderStatusThunk = createAsyncThunk(
    'rider/updateStatus',
    async (status, { rejectWithValue }) => {
        try {
            const response = await api.put('/rider/status', { status });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

export const confirmPickupThunk = createAsyncThunk(
    'rider/confirmPickup',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/rider/pickup/${orderId}`);
            toast.success('Pickup confirmed!');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm pickup');
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

export const confirmDeliveryThunk = createAsyncThunk(
    'rider/confirmDelivery',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/rider/deliver/${orderId}`);
            toast.success('Delivery confirmed!');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to confirm delivery');
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

export const fetchEarningsThunk = createAsyncThunk(
    'rider/fetchEarnings',
    async (period = 'weekly', { rejectWithValue }) => {
        try {
            const response = await api.get(`/rider/earnings?period=${period}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch earnings');
        }
    }
);

export const fetchPerformanceThunk = createAsyncThunk(
    'rider/fetchPerformance',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/rider/performance');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance metrics');
        }
    }
);

const initialState = {
    profile: null,
    dashboard: null,
    activeOrder: null,
    earnings: null,
    performance: null,
    loading: false,
    error: null,
};

const riderSlice = createSlice({
    name: 'rider',
    initialState,
    reducers: {
        setActiveOrder: (state, action) => {
            state.activeOrder = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRiderProfileThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchRiderProfileThunk.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
            .addCase(fetchRiderProfileThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            
            .addCase(fetchDashboardThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchDashboardThunk.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload; })
            .addCase(fetchDashboardThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            
            .addCase(fetchActiveOrderThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchActiveOrderThunk.fulfilled, (state, action) => { state.loading = false; state.activeOrder = action.payload; })
            .addCase(fetchActiveOrderThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(updateRiderStatusThunk.fulfilled, (state, action) => { 
                if (state.profile) state.profile.status = action.payload.status; 
            })

            .addCase(confirmPickupThunk.fulfilled, (state, action) => {
                if (state.activeOrder) state.activeOrder = action.payload;
            })

            .addCase(confirmDeliveryThunk.fulfilled, (state, action) => {
                state.activeOrder = null; // Clear active order after delivery
                if (state.profile) state.profile.status = 'Available';
            })

            .addCase(fetchEarningsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchEarningsThunk.fulfilled, (state, action) => { state.loading = false; state.earnings = action.payload; })
            .addCase(fetchEarningsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchPerformanceThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPerformanceThunk.fulfilled, (state, action) => { state.loading = false; state.performance = action.payload; })
            .addCase(fetchPerformanceThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
    }
});

export const { setActiveOrder } = riderSlice.actions;
export default riderSlice.reducer;
