import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Icon from '../../common/Icon';
import Modal from '../../Modals/Modal';
import api from '../../../api/axios';
import { useApiAction } from '../../../hooks/useApiAction';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

const MAX_COMMENT = 500;

const ReviewModal = ({ order, orderItem, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const subject = orderItem
    ? orderItem.name
    : `your order from ${order.restaurant?.name || order.restaurantName || 'the restaurant'}`;

  const { execute: handleSubmit, isSubmitting } = useApiAction(async (event) => {
    event.preventDefault();

    if (rating === 0) {
      toast.error('Please choose a rating first.');
      return;
    }

    try {
      /*
       * `restaurantId` is no longer sent. The server reads it off the order it
       * has already loaded and verified the caller owns — passing it from here
       * only created a value that had to be checked for agreement, and a
       * mismatch the user could do nothing about.
       */
      const payload = { orderId: order._id, rating, comment: comment.trim() || undefined };

      if (orderItem) {
        await api.post('/reviews/item', {
          ...payload,
          menuItemId:
            typeof orderItem.menuItem === 'object' ? orderItem.menuItem._id : orderItem.menuItem,
        });
      } else {
        await api.post('/reviews', payload);
      }

      toast.success('Thanks for your review!');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit your review.');
    }
  });

  const displayedRating = hoverRating || rating;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Rate your experience"
      description={`How was ${subject}?`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-stack_lg">
        {/*
         * A radio group rather than five unlabelled buttons. Previously a screen
         * reader announced "button" five times with no indication of what each
         * one meant or which was selected, and the control could not be operated
         * with arrow keys.
         */}
        <fieldset className="text-center">
          <legend className="sr-only">Rating out of five stars</legend>

          <div
            className="flex justify-center gap-1"
            role="radiogroup"
            aria-label="Rating"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star === 1 ? '' : 's'} — ${RATING_LABELS[star]}`}
                onMouseEnter={() => setHoverRating(star)}
                onFocus={() => setHoverRating(star)}
                onBlur={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 rounded-lg transition-transform duration-200 hover:scale-115 active:scale-95"
              >
                <Icon
                  name="star"
                  filled={star <= displayedRating}
                  className={`text-[38px] transition-colors duration-200 ${
                    star <= displayedRating ? 'text-warning' : 'text-surface-container-highest'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Reserved height so the panel does not jump as the label appears. */}
          <p
            aria-live="polite"
            className="mt-2 h-5 font-label text-label text-on-surface-variant transition-opacity duration-200"
          >
            {displayedRating ? RATING_LABELS[displayedRating] : ''}
          </p>
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="review-comment" className="block font-label text-label text-on-surface">
            Write a review <span className="text-secondary font-normal">(optional)</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            maxLength={MAX_COMMENT}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Tell us what you liked, or what could be better…"
            className="w-full h-28 resize-none rounded-xl border border-outline-variant bg-surface-container-low p-4 font-body text-body text-on-surface transition-colors placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-right font-label text-label text-secondary">
            {comment.length}/{MAX_COMMENT}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-button text-button font-bold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Icon name="sync" className="animate-spin text-[20px]" />}
          <span>{isSubmitting ? 'Submitting…' : 'Submit review'}</span>
        </button>
      </form>
    </Modal>
  );
};

export default ReviewModal;
