import React from 'react';

import Icon from '../common/Icon';
const RatingStars = ({ rating = 5, maxStars = 5, colorClass = "text-primary-container" }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= maxStars; i++) {
    if (i <= fullStars) {
      stars.push(
        <Icon name="star" className={`text-[16px] ${colorClass}`} filled key={i} />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <Icon name="star_half" className={`text-[16px] ${colorClass}`} key={i} />
      );
    } else {
      stars.push(
        <Icon name="star" className="text-[16px] text-surface-container-high" key={i} />
      );
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
};

export default RatingStars;
