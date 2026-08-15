import React from 'react';
import Icon from '../../common/Icon';

const OffersEmptyState = ({ searchQuery, activeRestaurantId, restaurantName }) => {
  return (
    <div className="bg-surface-container-lowest rounded-16 p-12 text-center border border-outline-variant/30 mt-8 shadow-sm">
      <Icon name="search_off" className="text-4xl text-on-secondary-container mb-2" />
      <h3 className="font-h3 text-h3 text-on-surface mb-2">No promotions found</h3>
      <p className="text-on-surface/80 max-w-md mx-auto">
        {searchQuery
          ? `We couldn't find any deals matching "${searchQuery}". Try checking the spelling or using different keywords.`
          : activeRestaurantId
            ? `${restaurantName || 'This restaurant'} hasn't added any active promotions yet. Check back soon!`
            : 'No active offers available right now. Check back soon!'}
      </p>
    </div>
  );
};

export default OffersEmptyState;
