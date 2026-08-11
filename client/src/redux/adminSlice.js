import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axios';

// Fetch all orders for admin
export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/orders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch admin orders'
      );
    }
  }
);

// Update order status
export const updateAdminOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status, estimatedDeliveryTime, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/status`, {
        status,
        estimatedDeliveryTime,
        rejectionReason
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  }
);

export const assignAdminRiderThunk = createAsyncThunk(
  'admin/assignRider',
  async ({ orderId, riderId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/orders/${orderId}/rider`, { riderId });
      return response.data.data.order;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to assign rider'
      );
    }
  }
);

// Fetch admin analytics
export const fetchAdminAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/analytics');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch admin analytics'
      );
    }
  }
);

/**
 * Loading state is split per concern.
 *
 * All four thunks previously shared one `loading` flag, and the orders table
 * and dashboard rendered skeletons off it. Two consequences, both visible as
 * flicker:
 *
 *  - Mutations blanked the list. Changing an order's status or assigning a
 *    rider set `loading = true`, so the whole table dropped to skeleton rows
 *    and snapped back on every single update.
 *  - Concurrent fetches fought each other. The dashboard dispatches orders and
 *    analytics together; whichever resolved first cleared the flag while the
 *    other was still in flight, so skeletons appeared, vanished and reappeared.
 *
 * `updating` now covers mutations so lists stay on screen while a write is in
 * flight, and the two fetches track independently.
 */
const initialState = {
  orders: [],
  analytics: null,
  ordersLoading: false,
  analyticsLoading: false,
  updating: false,
  error: null,
  successMessage: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.ordersLoading = false;
      state.analyticsLoading = false;
      state.updating = false;
      state.error = null;
      state.successMessage = null;
    },
    clearAdminSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminOrders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload;
      })

      // updateAdminOrderStatus
      .addCase(updateAdminOrderStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.successMessage = 'Order status updated successfully';
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // assignAdminRiderThunk
      .addCase(assignAdminRiderThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(assignAdminRiderThunk.fulfilled, (state, action) => {
        state.updating = false;
        state.successMessage = 'Rider assigned successfully';
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(assignAdminRiderThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // fetchAdminAnalytics
      .addCase(fetchAdminAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAdminAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminState, clearAdminSuccess } = adminSlice.actions;

export default adminSlice.reducer;
