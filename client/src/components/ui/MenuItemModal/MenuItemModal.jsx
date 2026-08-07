import React, { useState } from 'react';

import Icon from '../../common/Icon';
const MenuItemModal = ({ item, isOpen, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(
    item?.sizes?.length > 0 ? item.sizes[0] : null
  );
  
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  if (!isOpen || !item) return null;

  const handleAddOnToggle = (addon) => {
    const isSelected = selectedAddOns.some(a => a._id === addon._id || a.name === addon.name);
    if (isSelected) {
      setSelectedAddOns(selectedAddOns.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleAddToCart = () => {
    onAddToCart({
      ...item,
      selectedSize,
      selectedAddOns
    });
    onClose();
  };

  const currentPrice = 
    item.price + 
    (selectedSize ? selectedSize.additionalPrice : 0) + 
    selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center animate-in fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full md:w-[500px] max-h-[90vh] bg-surface text-on-surface rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 md:zoom-in-95">
        
        {/* Header Image */}
        <div className="h-64 w-full relative bg-surface-variant rounded-t-3xl p-4">
          <img src={item.image} alt={item.name} className="w-full h-full object-contain object-center drop-shadow-md" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
            <Icon name="close" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 pb-32 md:pb-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-h2 font-h2 font-bold">{item.name}</h2>
            <span className="text-primary font-bold text-xl">${currentPrice.toFixed(2)}</span>
          </div>
          <p className="text-secondary font-body mb-6">{item.description}</p>

          {/* Sizes */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-h3 text-h3 mb-3 bg-surface-variant px-4 py-2 rounded-lg font-bold">Choose Size <span className="text-error">*</span></h3>
              <div className="space-y-3">
                {item.sizes.map((size, idx) => (
                  <label key={idx} className="flex justify-between items-center p-3 border border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="size" 
                        value={size.name} 
                        checked={selectedSize?.name === size.name}
                        onChange={() => setSelectedSize(size)}
                        className="w-5 h-5 text-primary focus:ring-primary accent-primary"
                      />
                      <span className="font-body font-bold text-on-surface">{size.name}</span>
                    </div>
                    {size.additionalPrice > 0 && <span className="text-secondary">+${size.additionalPrice.toFixed(2)}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="mb-6">
              <h3 className="font-h3 text-h3 mb-3 bg-surface-variant px-4 py-2 rounded-lg font-bold">Add-ons (Optional)</h3>
              <div className="space-y-3">
                {item.addOns.map((addon, idx) => {
                  const isChecked = selectedAddOns.some(a => a.name === addon.name);
                  return (
                    <label key={idx} className="flex justify-between items-center p-3 border border-outline-variant rounded-xl cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => handleAddOnToggle(addon)}
                          className="w-5 h-5 text-primary rounded focus:ring-primary accent-primary"
                        />
                        <span className="font-body text-on-surface">{addon.name}</span>
                      </div>
                      <span className="text-secondary">+${addon.price.toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface border-t border-outline-variant md:relative md:border-t-0 md:pt-0">
          <button 
            onClick={handleAddToCart}
            disabled={item.sizes?.length > 0 && !selectedSize}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-button font-bold text-lg hover:opacity-90 shadow-lg disabled:opacity-50 transition-all flex justify-between px-6"
          >
            <span>Add to Cart</span>
            <span>${currentPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemModal;
