import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onDelete }) => {
  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 pb-6 border-b border-outline-variant last:border-0 last:pb-0">
      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
        <img
          className="w-full h-full object-cover"
          alt={item.name}
          src={item.image}
        />
      </div>
      <div className="flex-grow flex flex-col justify-between py-1">
        <div>
          <h4 className="font-bold text-body text-on-surface">{item.name}</h4>
          <p className="text-secondary text-small">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-outline-variant rounded-full p-1 gap-4 bg-surface-container-low">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="font-bold">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-primary">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={() => onDelete(item.id)}
              aria-label="Delete item"
              className="text-secondary hover:text-error transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
