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
          {item.selectedSize && (
            <p className="text-secondary text-small mt-1">
              <span className="font-bold">Size:</span> {item.selectedSize.name} (+${item.selectedSize.additionalPrice.toFixed(2)})
            </p>
          )}
          {item.selectedAddOns && item.selectedAddOns.length > 0 && (
            <p className="text-secondary text-small mt-1">
              <span className="font-bold">Add-ons:</span> {item.selectedAddOns.map(a => `${a.name} (+$${a.price.toFixed(2)})`).join(', ')}
            </p>
          )}
          {!item.selectedSize && (!item.selectedAddOns || item.selectedAddOns.length === 0) && (
            <p className="text-secondary text-small">{item.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-outline-variant rounded-full p-1 gap-4 bg-surface-container-low">
            <button
              onClick={() => onUpdateQuantity(item.cartItemId, -1)}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="font-bold">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.cartItemId, 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold text-primary">
              ${((item.price + (item.selectedSize?.additionalPrice || 0) + (item.selectedAddOns?.reduce((sum, a) => sum + a.price, 0) || 0)) * item.quantity).toFixed(2)}
            </span>
            <button
              onClick={() => onDelete(item.cartItemId)}
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
