import React, { useState } from 'react';
import Icon from '../../common/Icon';
import { toast } from 'react-hot-toast';
import api from '../../../api/axios';
import { useApiAction } from '../../../hooks/useApiAction';

const ReviewModal = ({ order, orderItem, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const { execute: handleSubmit, isSubmitting } = useApiAction(async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating star.');
      return;
    }

    try {
      if (orderItem) {
        // Item review
        await api.post('/reviews/item', {
          restaurantId: typeof order.restaurant === 'object' ? order.restaurant._id : order.restaurant,
          orderId: order._id,
          menuItemId: typeof orderItem.menuItem === 'object' ? orderItem.menuItem._id : orderItem.menuItem,
          rating,
          comment
        });
      } else {
        // Restaurant review
        await api.post('/reviews', {
          restaurantId: typeof order.restaurant === 'object' ? order.restaurant._id : order.restaurant,
          orderId: order._id,
          rating,
          comment
        });
      }
      
      toast.success('Thank you for your review!');
      onSuccess(); // Triggers a re-fetch or state update
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review.');
    }
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <Icon name="close" className="text-[20px]" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="star" className="text-[32px]" />
          </div>
          <h2 className="font-h3 text-h3 font-bold text-on-surface mb-2">Rate your experience</h2>
          <p className="font-body text-body text-secondary">
            How was {orderItem ? orderItem.name : `your order from ${order.restaurantName || 'the restaurant'}`}?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                {/* Filled only up to the selected/hovered star — the whole row
                    was rendering solid regardless of rating. */}
                <Icon
                  name="star"
                  filled={star <= (hoverRating || rating)}
                  className={`text-[40px] ${star <= (hoverRating || rating) ? 'text-warning' : 'text-surface-variant'
                    }`}
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="font-label text-label text-on-surface ml-1">Write a review (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or what could be better..."
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-4 font-body text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none h-28"
            />
          </div>

          {/* Actions */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full h-12 rounded-xl bg-primary text-on-primary font-button text-button font-bold hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed gap-2"
          >
            {isSubmitting && <Icon name="sync" className="animate-spin text-[20px]" />}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
