import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../common/Icon';
import HomeFooter from '../../globalComponents/HomeFooter';
import { OrderListSkeleton } from '../../common/Skeleton';
import { APP_ROUTES } from '../../../constants';
import { getOrderStatusBadgeClass, getOrderStatusLabel } from '../../../constants/orderStatus';

const OrderPicker = ({ loading, trackableOrders }) => {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <main id="main-content" tabIndex={-1} className="grow w-full max-w-3xl mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg">
        <h1 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface mb-2">
          Track an order
        </h1>
        <p className="font-body text-body text-secondary mb-stack_lg">
          Pick an order below to follow it live on the map.
        </p>

        {loading ? (
          <OrderListSkeleton count={3} />
        ) : trackableOrders.length > 0 ? (
          <div className="grid gap-stack_md stagger-children">
            {trackableOrders.map((o) => (
              <Link
                key={o._id}
                to={`${APP_ROUTES.TRACK_ORDER}?orderId=${o._id}`}
                className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm flex items-center justify-between gap-4 hover:shadow-md hover:border-outline-variant transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-h3 text-h3 text-on-surface font-bold">
                      Order #{o._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`font-label text-label px-3 py-1 rounded-full font-bold ${getOrderStatusBadgeClass(o.status)}`}>
                      {getOrderStatusLabel(o.status)}
                    </span>
                  </div>
                  <p className="font-body text-small text-secondary truncate">
                    {(o.items || []).map((i) => `${i.quantity}x ${i.name || 'Item'}`).join(', ')}
                  </p>
                </div>
                <Icon name="chevron_right" className="text-secondary shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-surface-container-lowest rounded-xl border border-surface-variant animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Icon name="local_shipping" className="text-6xl text-secondary mb-4" />
            <h2 className="font-h3 text-h3 text-on-surface mb-2">No orders in progress</h2>
            <p className="font-body text-body text-secondary mb-6 max-w-sm mx-auto">
              When you place an order you'll be able to follow the rider here in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={APP_ROUTES.HOME}
                className="inline-flex items-center justify-center gap-2 px-6 h-12 bg-primary text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-opacity"
              >
                Browse restaurants
              </Link>
              <Link
                to={APP_ROUTES.ORDERS}
                className="inline-flex items-center justify-center gap-2 px-6 h-12 border border-outline text-on-surface rounded-xl font-button text-button hover:bg-surface-container transition-colors"
              >
                View past orders
              </Link>
            </div>
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
};

export default OrderPicker;
