import React, { useEffect } from 'react';
import Icon from '../../components/common/Icon';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrdersThunk } from '../../redux/orderSlice';
import { Link } from 'react-router-dom';
import TopNavBar from '../../components/globalComponents/Navbar';
import HomeFooter from '../../components/globalComponents/HomeFooter';
import { APP_ROUTES } from '../../constants/appRoutes';
import {
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  isActiveOrder,
} from '../../constants/orderStatus';
import { OrderListSkeleton } from '../../components/common/Skeleton';

const OrderHistoryScreen = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrdersThunk());
  }, [dispatch]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative">
      <TopNavBar />
      <main className="grow w-full max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg">
        <div className="flex items-end justify-between gap-4 mb-stack_lg">
          <h1 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface">
            My Orders
          </h1>
          {!loading && !error && orders.length > 0 && (
            <p className="font-body text-small text-secondary">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </p>
          )}
        </div>

        {loading ? (
          <OrderListSkeleton count={4} />
        ) : error ? (
          <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20 flex gap-3 items-center animate-in fade-in">
            <Icon name="error" />
            <span className="grow">{error}</span>
            <button
              onClick={() => dispatch(fetchMyOrdersThunk())}
              className="shrink-0 px-4 py-2 rounded-lg border border-error/40 font-button text-small hover:bg-error/10 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 bg-surface-container-lowest rounded-xl border border-surface-variant animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Icon name="receipt_long" className="text-6xl text-secondary mb-4" />
            <h2 className="font-h3 text-h3 text-on-surface mb-2">No orders yet</h2>
            <p className="font-body text-body text-secondary mb-6 max-w-sm mx-auto">
              Once you place your first order it will show up here, with live tracking and receipts.
            </p>
            <Link
              to={APP_ROUTES.HOME}
              className="inline-flex items-center gap-2 px-6 h-12 bg-primary text-on-primary rounded-xl font-button text-button hover:opacity-90 transition-opacity"
            >
              <span>Browse restaurants</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-stack_md stagger-children">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md hover:border-outline-variant transition-all"
              >
                <div className="grow min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-h3 text-h3 text-on-surface font-bold">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={`font-label text-label px-3 py-1 rounded-full font-bold ${getOrderStatusBadgeClass(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                    {isActiveOrder(order.status) && (
                      <span className="flex items-center gap-1.5 font-label text-label text-tertiary">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="font-body text-small text-secondary mb-2">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="font-body text-body text-on-surface-variant truncate">
                    {(order.items || [])
                      .map((item) => `${item.quantity}x ${item.name || item.menuItem?.name || 'Item'}`)
                      .join(', ') || 'No items recorded'}
                  </p>
                </div>
                <div className="flex flex-col items-stretch md:items-end gap-3 min-w-30 w-full md:w-auto">
                  <span className="font-h3 text-h3 text-primary font-bold md:text-right">
                    ${(order.totalAmount || 0).toFixed(2)}
                  </span>
                  <Link
                    to={`${APP_ROUTES.TRACK_ORDER}?orderId=${order._id}`}
                    className="text-on-primary bg-primary px-4 py-2.5 rounded-full font-button text-button hover:opacity-90 transition-opacity w-full text-center whitespace-nowrap"
                  >
                    {isActiveOrder(order.status) ? 'Track order' : 'View details'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
};

export default OrderHistoryScreen;
