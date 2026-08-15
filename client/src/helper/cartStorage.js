import { LOCAL_STORAGE_KEYS } from '../constants';

export const loadPersistedCart = () => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed.items !== 'object' || parsed.items === null) return null;

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

/** Persist helper — wired up in the store so a refresh doesn't drop the cart. */
export const persistCart = (cartState) => {
    try {
        localStorage.setItem(
            LOCAL_STORAGE_KEYS.CART,
            JSON.stringify({
                items: cartState.items,
                totalQuantity: cartState.totalQuantity,
                restaurantId: cartState.restaurantId,
            })
        );
    } catch {
       
    }
};
