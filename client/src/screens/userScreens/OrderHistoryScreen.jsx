import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyOrdersThunk } from '../../redux/orderSlice';
import { Link } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import HomeFooter from '../../components/homeScreen/homeScreenComponents/HomeFooter';
import { APP_ROUTES } from '../../constants/appRoutes';

const OrderHistoryScreen = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrdersThunk());
  }, [dispatch]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative">
      <TopNavBar />
      <main className="flex-grow w-full max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg">
        <h1 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface mb-stack_lg">
          My Orders
        </h1>
        
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20 flex gap-2 items-center">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 bg-surface-container-lowest rounded-xl border border-surface-variant">
            <span className="material-symbols-outlined text-6xl text-secondary mb-4">receipt_long</span>
            <p className="font-body text-body text-secondary">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="grid gap-stack_md">
            {orders.map((order) => (
              <div key={order._id} className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-h3 text-h3 text-on-surface font-bold">
                      Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </span>
                    <span className={`font-label text-label px-3 py-1 rounded-full font-bold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'CANCELLED' || order.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      order.status === 'PLACED' || order.status === 'ACCEPTED' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-body text-small text-secondary mb-2">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="font-body text-body text-on-surface-variant truncate">
                    {order.items.map(item => `${item.quantity}x ${item.name || item.menuItem?.name}`).join(', ')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 min-w-[120px]">
                  <span className="font-h3 text-h3 text-primary font-bold">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                  <Link 
                    to={`${APP_ROUTES.TRACK_ORDER}?orderId=${order._id}`}
                    className="text-on-primary bg-primary px-4 py-2 rounded-full font-button text-button hover:bg-primary/90 transition-colors w-full text-center"
                  >
                    View Details
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
