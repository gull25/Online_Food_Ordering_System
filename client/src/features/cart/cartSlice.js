import { createSlice } from '@reduxjs/toolkit';

export const generateCartItemId = (item) => {
    let id = item._id || item.id;
    if (item.selectedSize) {
        id += `-${item.selectedSize.name}`;
    }
    if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        const addOnNames = item.selectedAddOns.map(a => a.name).sort().join('-');
        id += `-${addOnNames}`;
    }
    return id;
};

const initialState = {
  items: {},
  totalQuantity: 0,
  restaurantId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      
      // If cart is empty, lock it to this item's restaurant
      if (state.totalQuantity === 0) {
        state.restaurantId = item.restaurant || item.restaurantId;
      }

      const cartItemId = generateCartItemId(item);
      if (!state.items[cartItemId]) {
        state.items[cartItemId] = { item, quantity: 1, cartItemId };
      } else {
        state.items[cartItemId].quantity++;
      }
      state.totalQuantity++;
    },
    removeFromCart: (state, action) => {
      const cartItemId = action.payload;
      if (state.items[cartItemId]) {
        if (state.items[cartItemId].quantity > 1) {
          state.items[cartItemId].quantity--;
        } else {
          delete state.items[cartItemId];
        }
        state.totalQuantity--;
      }
    },
    clearCart: (state) => {
      state.items = {};
      state.totalQuantity = 0;
      state.restaurantId = null;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
