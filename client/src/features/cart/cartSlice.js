import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: {},
  totalQuantity: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      if (!state.items[item.id]) {
        state.items[item.id] = { item, quantity: 1 };
      } else {
        state.items[item.id].quantity++;
      }
      state.totalQuantity++;
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      if (state.items[itemId]) {
        if (state.items[itemId].quantity > 1) {
          state.items[itemId].quantity--;
        } else {
          delete state.items[itemId];
        }
        state.totalQuantity--;
      }
    },
    clearCart: (state) => {
      state.items = {};
      state.totalQuantity = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
