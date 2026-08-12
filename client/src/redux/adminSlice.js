import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axios';

/**
 * Orders for the admin table.
 *
 * `/admin/orders` is paginated now -- it used to answer with the restaurant's
 * entire order history in a single response, which grew without bound. The
 * table filters and paginates client-side, so this walks the pages and
 * accumulates them, stopping at MAX_ORDERS.
 *
 * The cap is deliberate and surfaced: `truncated` is set when there is more
 * history than was loaded, so the UI can say so rather than quietly showing a
 * partial list as if it were everything.
 */
const PAGE_SIZE = 100;
const MAX_ORDERS = 500;

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const collected = [];
      let page = 1;
      let total = 0;

      // Bounded: at most MAX_ORDERS / PAGE_SIZE requests, however large the
      // history is.
      while (collected.length < MAX_ORDERS) {
        const response = await axiosInstance.get('/admin/orders', {
          params: { page, limit: PAGE_SIZE, ...(params.status ? { status: params.status } : {}) },
        });

        const batch = response.data.data ?? [];
        total = response.data.total ?? batch.length;
        collected.push(...batch);

        if (batch.length < PAGE_SIZE || collected.length >= total) break;
        page += 1;
      }

      return { orders: collected, total, truncated: collected.length < total };
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
  ordersTotal: 0,
  ordersTruncated: false,
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
        state.orders = action.payload.orders;
        state.ordersTotal = action.payload.total;
        state.ordersTruncated = action.payload.truncated;
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
