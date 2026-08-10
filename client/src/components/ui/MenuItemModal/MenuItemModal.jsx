import React, { useState, useEffect } from 'react';

import Icon from '../../common/Icon';
import api from '../../../api/axios';

const MenuItemModal = ({ item, isOpen, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(
    item?.sizes?.length > 0 ? item.sizes[0] : null
  );

  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (isOpen && item?._id) {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const res = await api.get(`/reviews/item/${item._id}`);
          setReviews(res.data.data || []);
        } catch (error) {
          console.error('Failed to fetch item reviews', error);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [isOpen, item]);

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
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-h2 font-h2 font-bold">{item.name}</h2>
            <span className="text-primary font-bold text-xl">${currentPrice.toFixed(2)}</span>
          </div>
          
          <div className="mb-3 flex items-center">
            {item.numReviews > 0 ? (
              <div className="flex items-center gap-1">
                <Icon name="star" className="text-[16px] text-warning" />
                <span className="font-button text-button text-on-surface font-bold">{item.rating?.toFixed(1)}</span>
                <span className="font-label text-[12px] text-secondary">({item.numReviews} rating{item.numReviews !== 1 ? 's' : ''})</span>
              </div>
            ) : (
              <span className="font-label text-[12px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-center">New</span>
            )}
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

          {/* Reviews Section */}
          <div className="mt-8 pt-6 border-t border-outline-variant">
            <h3 className="font-h3 text-h3 mb-4 font-bold flex items-center gap-2">
              <Icon name="chat" className="text-primary" />
              Customer Reviews
            </h3>
            {loadingReviews ? (
              <div className="flex justify-center p-4"><Icon name="sync" className="animate-spin text-primary text-2xl" /></div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.name || 'U'}&background=ae3200&color=fff`} 
                          alt={review.user?.name} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-button text-[14px] font-bold text-on-surface">{review.user?.name || 'Customer'}</p>
                          <p className="font-label text-[12px] text-secondary">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="star" className="text-[14px] text-warning" />
                        <span className="font-button text-[14px] font-bold">{review.rating}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="font-body text-[14px] text-on-surface/90 mt-2 italic">"{review.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <Icon name="inbox" className="text-on-surface-variant text-[32px] mb-2" />
                <p className="text-secondary font-body text-[14px]">No reviews yet. Order and be the first to review!</p>
              </div>
            )}
          </div>
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
