import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'foodoraCart';

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

/**
 * A menu item's `restaurant` field is sometimes a raw ObjectId string and
 * sometimes a populated document, depending on which endpoint served it.
 *
 * Storing it unnormalised meant `state.restaurantId` could be an object, so the
 * "items from another restaurant" comparison in the menu screen compared an
 * object to a string and always failed — blocking a second item from the *same*
 * restaurant. Everything is coerced to a plain id string here.
 */
export const resolveRestaurantId = (item) => {
    const raw = item?.restaurant ?? item?.restaurantId;
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    return raw._id ? String(raw._id) : String(raw);
};

const loadPersistedCart = () => {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed.items !== 'object' || parsed.items === null) return null;

        // Recompute the total instead of trusting the stored number, so a
        // partially-written value can never desync the badge from the contents.
        const totalQuantity = Object.values(parsed.items).reduce(
            (sum, entry) => sum + (Number(entry?.quantity) || 0),
            0
        );

        return {
            items: parsed.items,
            totalQuantity,
            restaurantId: totalQuantity > 0 ? parsed.restaurantId ?? null : null,
        };
    } catch {
        return null;
    }
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

            // Release the restaurant lock once the cart is empty. Leaving it set
            // meant a user who emptied their cart still got "your cart contains
            // items from another restaurant" when ordering somewhere else.
            if (state.totalQuantity <= 0) {
                state.totalQuantity = 0;
                state.restaurantId = null;
            }
        },
        /**
         * Removes a line entirely, regardless of quantity.
         *
         * The checkout screen previously deleted an item by dispatching
         * `removeFromCart` once per unit in a loop — N store updates and N
         * re-renders to remove one row.
         */
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

/** Persist helper — wired up in the store so a refresh doesn't drop the cart. */
export const persistCart = (cartState) => {
    try {
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify({
                items: cartState.items,
                totalQuantity: cartState.totalQuantity,
                restaurantId: cartState.restaurantId,
            })
        );
    } catch {
        // Quota exceeded or storage blocked — the in-memory cart still works.
    }
};

export default cartSlice.reducer;
