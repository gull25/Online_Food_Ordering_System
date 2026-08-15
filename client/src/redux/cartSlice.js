import { createSlice } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { loadPersistedCart } from '../helper/cartStorage';

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


export const resolveRestaurantId = (item) => {
    const raw = item?.restaurant ?? item?.restaurantId;
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    return raw._id ? String(raw._id) : String(raw);
};

const initialState = loadPersistedCart() || {
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
                state.restaurantId = resolveRestaurantId(item);
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
            if (!state.items[cartItemId]) return;

            if (state.items[cartItemId].quantity > 1) {
                state.items[cartItemId].quantity--;
            } else {
                delete state.items[cartItemId];
            }
            state.totalQuantity--;

           
            if (state.totalQuantity <= 0) {
                state.totalQuantity = 0;
                state.restaurantId = null;
            }
        },
       
        removeItemCompletely: (state, action) => {
            const cartItemId = action.payload;
            const entry = state.items[cartItemId];
            if (!entry) return;

            state.totalQuantity = Math.max(0, state.totalQuantity - entry.quantity);
            delete state.items[cartItemId];

            if (state.totalQuantity === 0) {
                state.restaurantId = null;
            }
        },
        clearCart: (state) => {
            state.items = {};
            state.totalQuantity = 0;
            state.restaurantId = null;
        },
    },
});

export const { addToCart, removeFromCart, removeItemCompletely, clearCart } = cartSlice.actions;

export default cartSlice.reducer;

