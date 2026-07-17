import React from 'react';

const PriceTag = ({ price, currency = '€', className = 'text-primary' }) => {
  return (
    <span className={className}>
      {currency}
      {price.toFixed(2)}
    </span>
  );
};

export default PriceTag;
