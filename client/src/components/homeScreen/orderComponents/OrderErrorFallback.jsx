import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../common/Icon';
import HomeFooter from '../../globalComponents/HomeFooter';
import { APP_ROUTES } from '../../../constants';

const OrderErrorFallback = ({ error }) => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <main className="grow flex flex-col items-center justify-center text-center px-margin_mobile py-stack_lg">
        <Icon name="receipt_long" className="text-6xl text-surface-variant mb-4" />
        <h1 className="font-h2 text-h2-mobile md:text-h2 text-on-surface mb-2">Order not found</h1>
        <p className="font-body text-body text-secondary max-w-md mb-6">
          {error || "We couldn't find that order. It may have been removed, or the link may be incorrect."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={APP_ROUTES.TRACK_ORDER}
            className="inline-flex items-center justify-center px-6 h-12 bg-primary text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-opacity"
          >
            Choose another order
          </Link>
          <Link
            to={APP_ROUTES.ORDERS}
            className="inline-flex items-center justify-center px-6 h-12 border border-outline text-on-surface rounded-xl font-button text-button hover:bg-surface-container transition-colors"
          >
            My orders
          </Link>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
};

export default OrderErrorFallback;
