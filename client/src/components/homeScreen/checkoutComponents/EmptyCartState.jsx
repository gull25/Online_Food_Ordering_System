import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../common/Icon';

const EmptyCartState = () => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-xl">
      <div className="w-24 h-24 bg-surface-variant rounded-full flex items-center justify-center mb-6">
        <Icon name="shopping_cart_off" className="text-5xl text-on-surface-variant" />
      </div>
      <h3 className="text-h3 font-h3 mb-2 text-on-surface">Your Cart is Empty</h3>
      <p className="text-body font-body text-secondary max-w-md mx-auto mb-6">
        Looks like you haven't added any delicious items to your cart yet.
      </p>
      <Link
        to="/"
        className="px-6 h-12 bg-primary text-on-primary rounded-xl font-button text-button flex items-center gap-2 hover:opacity-90 transition-opacity"
      >
        <span>Browse Restaurants</span>
        <Icon name="arrow_forward" />
      </Link>
    </div>
  );
};

export default EmptyCartState;
