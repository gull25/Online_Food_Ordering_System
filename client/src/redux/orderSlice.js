import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Async Thunks
export const createOrderThunk = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return {
        order: response.data.data,
        clientSecret: response.data.clientSecret,
        paymentUrl: response.data.paymentUrl
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place order');
    }
  }
);

export const fetchOrderByIdThunk = createAsyncThunk(
  'orders/fetchById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

/**
 * The customer's order history.
 *
 * `/orders/my-orders` is paginated; passing `{ page }` appends rather than
 * replaces, which is what drives the "Load more" control on the history screen.
 * The endpoint previously returned every order the account had ever placed in
 * one response.
 */
export const fetchMyOrdersThunk = createAsyncThunk(
  'orders/fetchMyOrders',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/my-orders', { params: { page, limit } });
      return {
        orders: response.data.data ?? [],
        page: response.data.page ?? page,
        pages: response.data.pages ?? 1,
        total: response.data.total ?? 0,
        append: page > 1,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order history');
    }
  }
);

export const cancelOrderThunk = createAsyncThunk(
  'orders/cancel',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: 'CANCELLED' });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

const initialState = {
  orders: [],
  ordersPage: 1,
  ordersPages: 1,
  ordersTotal: 0,
  currentOrder: null,
  // `loading` covers reads (fetching an order or the order list).
  // `mutating` covers writes, so a write never blanks a screen that is already
  // showing data.
  loading: false,
  mutating: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    orderStatusUpdated: (state, action) => {
      const updatedOrder = action.payload;
      if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
        state.currentOrder = updatedOrder;
      }
      const index = state.orders.findIndex(o => o._id === updatedOrder._id);
      if (index !== -1) {
        state.orders[index] = updatedOrder;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        // Prepended, not pushed: the list is sorted newest-first, so appending
        // put a just-placed order at the very bottom of the history.
        state.orders.unshift(action.payload.order);
        state.ordersTotal += 1;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order By Id
      .addCase(fetchOrderByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Orders
      .addCase(fetchMyOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        const { orders, page, pages, total, append } = action.payload;

        // De-duplicated on append: a new order arriving between two page
        // requests shifts every later row down one, which would otherwise
        // repeat the boundary order.
        if (append) {
          const seen = new Set(state.orders.map((order) => order._id));
          state.orders.push(...orders.filter((order) => !seen.has(order._id)));
        } else {
          state.orders = orders;
        }

        state.ordersPage = page;
        state.ordersPages = pages;
        state.ordersTotal = total;
      })
      .addCase(fetchMyOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Order.
      // Uses `mutating`, not `loading`: the track-order screen renders its
      // full-page loading state off `loading`, so cancelling used to tear the
      // whole page down to a spinner and rebuild it instead of just updating
      // the status badge in place.
      .addCase(cancelOrderThunk.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.mutating = false;
        if (state.currentOrder && state.currentOrder._id === action.payload._id) {
          state.currentOrder = action.payload;
        }
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload;
      });
  },
});

export const { setOrders, setCurrentOrder, setLoading, setError, orderStatusUpdated } = orderSlice.actions;
export default orderSlice.reducer;
