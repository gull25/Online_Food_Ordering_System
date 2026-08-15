import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
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

export const fetchAvailableDeliveriesThunk = createAsyncThunk(
    'rider/fetchAvailableDeliveries',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/rider/available');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch available deliveries');
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

export const fetchDeliveryHistoryThunk = createAsyncThunk(
    'rider/fetchDeliveryHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/rider/history');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery history');
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

export const acceptDeliveryThunk = createAsyncThunk(
    'rider/acceptDelivery',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/rider/accept/${orderId}`);
            toast.success('Delivery accepted!');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept delivery');
            return rejectWithValue(error.response?.data?.message);
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

export const startDeliveryThunk = createAsyncThunk(
    'rider/startDelivery',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/rider/start/${orderId}`);
            toast.success('Delivery started!');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start delivery');
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

export const cashOutThunk = createAsyncThunk(
    'rider/cashOut',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.post('/rider/cashout');
            toast.success('Cash out successful!');
            return response.data.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cash out');
            return rejectWithValue(error.response?.data?.message);
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
    availableDeliveries: [],
    activeOrder: null,
    deliveryHistory: [],
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

            .addCase(fetchAvailableDeliveriesThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAvailableDeliveriesThunk.fulfilled, (state, action) => { state.loading = false; state.availableDeliveries = action.payload; })
            .addCase(fetchAvailableDeliveriesThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(fetchDeliveryHistoryThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchDeliveryHistoryThunk.fulfilled, (state, action) => { state.loading = false; state.deliveryHistory = action.payload; })
            .addCase(fetchDeliveryHistoryThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(acceptDeliveryThunk.fulfilled, (state, action) => {
                state.activeOrder = action.payload;
                state.availableDeliveries = state.availableDeliveries.filter(d => d._id !== action.payload._id);
                if (state.profile) state.profile.status = 'Busy';
            })

            .addCase(confirmPickupThunk.fulfilled, (state, action) => {
                if (state.activeOrder) state.activeOrder = action.payload;
            })

            .addCase(startDeliveryThunk.fulfilled, (state, action) => {
                if (state.activeOrder) state.activeOrder = action.payload;
            })

            .addCase(confirmDeliveryThunk.fulfilled, (state) => {
                state.activeOrder = null; // Clear active order after delivery
                if (state.profile) state.profile.status = 'Available';
            })

            .addCase(fetchEarningsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchEarningsThunk.fulfilled, (state, action) => { state.loading = false; state.earnings = action.payload; })
            .addCase(fetchEarningsThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            .addCase(cashOutThunk.fulfilled, (state, action) => {
                if (state.earnings) {
                    state.earnings.availableBalance = 0;
                    state.earnings.payoutHistory.unshift(action.payload);
                }
            })

            .addCase(fetchPerformanceThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPerformanceThunk.fulfilled, (state, action) => { state.loading = false; state.performance = action.payload; })
            .addCase(fetchPerformanceThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
    }
});

export const { setActiveOrder } = riderSlice.actions;
export default riderSlice.reducer;
