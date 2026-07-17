import React from 'react';

const RatingStars = ({ rating = 5, maxStars = 5 }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= maxStars; i++) {
    if (i <= fullStars) {
      stars.push(
        <span key={i} className="material-symbols-outlined text-[16px] fill text-primary-container">
          star
        </span>
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <span key={i} className="material-symbols-outlined text-[16px] text-primary-container">
          star_half
        </span>
      );
    } else {
      stars.push(
        <span key={i} className="material-symbols-outlined text-[16px] text-surface-container-high">
          star
        </span>
      );
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export default RatingStars;
