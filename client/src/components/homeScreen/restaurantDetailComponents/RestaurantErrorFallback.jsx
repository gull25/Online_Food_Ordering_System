import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../common/Icon';
import HomeFooter from '../../globalComponents/HomeFooter';
import { APP_ROUTES } from '../../../constants';

const RestaurantErrorFallback = ({ detailError }) => {
  const navigate = useNavigate();

  return (
    <div className="font-body text-body bg-background min-h-screen flex flex-col">
      <main id="main-content" tabIndex={-1} className="grow flex flex-col items-center justify-center text-center px-margin_mobile py-stack_lg">
        <Icon name="storefront" className="text-6xl text-surface-variant mb-4" />
        <h1 className="font-h2 text-h2-mobile md:text-h2 text-on-surface mb-2">Restaurant unavailable</h1>
        <p className="font-body text-body text-secondary max-w-md mb-6">{detailError}</p>
        <button
          onClick={() => navigate(APP_ROUTES.HOME)}
          className="px-6 h-12 bg-primary text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-opacity"
        >
          Back to restaurants
        </button>
      </main>
      <HomeFooter />
    </div>
  );
};

export default RestaurantErrorFallback;
