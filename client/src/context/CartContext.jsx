import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  const addToCart = (item) => {
    setCart((prevCart) => ({
      ...prevCart,
      [item.id]: {
        item,
        quantity: (prevCart[item.id]?.quantity || 0) + 1,
      },
    }));
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[itemId]) {
        if (newCart[itemId].quantity > 1) {
          newCart[itemId] = { ...newCart[itemId], quantity: newCart[itemId].quantity - 1 };
        } else {
          delete newCart[itemId];
        }
      }
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, entry) => sum + entry.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
