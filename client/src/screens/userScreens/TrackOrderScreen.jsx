import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/common/Icon';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchOrderByIdThunk,
  cancelOrderThunk,
  orderStatusUpdated,
  fetchMyOrdersThunk,
} from '../../redux/orderSlice';
import TopNavBar from '../../components/layout/Navbar';
import HomeFooter from '../../components/homeScreen/homeScreenComponents/HomeFooter';
import OrderStatusSteps from '../../components/homeScreen/orderComponents/OrderStatusSteps';
import OrderMap from '../../components/homeScreen/orderComponents/OrderMap';
import LiveTracker from '../../components/homeScreen/orderComponents/LiveTracker';
import DeliveryDetails from '../../components/homeScreen/orderComponents/DeliveryDetails';
import ReviewModal from '../../components/homeScreen/orderComponents/ReviewModal';
import { socket, connectSocket, joinOrderRoom, leaveOrderRoom } from '../../helper/socket';
import { setCurrentOrder } from '../../redux/orderSlice';
import { toast } from 'react-hot-toast';
import {
  ORDER_STATUS,
  ORDER_TIMELINE_SEQUENCE,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  isActiveOrder,
} from '../../constants/orderStatus';
import { APP_ROUTES } from '../../constants';
import { OrderListSkeleton } from '../../components/common/Skeleton';

const BASE_TIMELINE_STEPS = [
  {
    status: 'PLACED',
    title: 'Order Placed',
    description: "We've received your order.",
    icon: 'check',
  },
  {
    status: 'ACCEPTED',
    title: 'Order Accepted',
    description: 'The restaurant has accepted your order.',
    icon: 'thumb_up',
  },
  {
    status: 'PREPARING',
    title: 'Preparing Food',
    description: 'The kitchen is preparing your meal.',
    icon: 'restaurant_menu',
  },
  {
    status: 'READY_FOR_PICKUP',
    title: 'Ready for Pickup',
    description: 'Your order is ready to be picked up.',
    icon: 'done_all',
  },
  {
    status: 'RIDER_ASSIGNED',
    title: 'Rider Assigned',
    description: 'A rider has been assigned.',
    icon: 'person',
  },
  {
    status: 'PICKED_UP',
    title: 'Picked Up',
    description: 'The rider has picked up your order.',
    icon: 'shopping_bag',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    title: 'Out For Delivery',
    description: 'Your driver is on the way.',
    icon: 'two_wheeler',
  },
  {
    status: 'DELIVERED',
    title: 'Delivered',
    description: 'Enjoy your meal!',
    icon: 'home',
  },
];

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentOrder: order, orders, loading, mutating, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (orderId) {
      // Clear any stale previous order first
      dispatch(setCurrentOrder(null));
      dispatch(fetchOrderByIdThunk(orderId));
    }
    // Cleanup: clear order from Redux when leaving the page
    return () => {
      dispatch(setCurrentOrder(null));
    };
  }, [dispatch, orderId]);

  /**
   * Reaching this page without an `orderId` is the normal case — the "Track
   * Order" link in the navbar has no order to point at.
   *
   * Previously that path rendered a bare "Order not found. Please check your
   * order ID." on an otherwise empty screen: no navbar, no footer, no way back.
   * Instead, load the user's orders and either jump straight to the one live
   * order or let them pick from the list below.
   */
  useEffect(() => {
    if (!orderId) dispatch(fetchMyOrdersThunk());
  }, [dispatch, orderId]);

  const trackableOrders = useMemo(
    () => (orders || []).filter((o) => isActiveOrder(o.status)),
    [orders]
  );

  useEffect(() => {
    // Exactly one order in flight — skip the picker, it has only one answer.
    if (!orderId && trackableOrders.length === 1) {
      navigate(`${APP_ROUTES.TRACK_ORDER}?orderId=${trackableOrders[0]._id}`, { replace: true });
    }
  }, [orderId, trackableOrders, navigate]);

  // WebSocket Integration for Real-Time Updates
  useEffect(() => {
    if (!user?._id || !orderId) return;

    // 1. Connect and register this user
    connectSocket(user._id);

    // 2. Join the specific order room so we receive events for this order only
    joinOrderRoom(orderId);

    // 3. Listen for status updates (restaurant admin changed status)
    socket.on('orderStatusUpdate', (updatedOrder) => {
      if (updatedOrder._id === orderId || updatedOrder._id?.toString() === orderId) {
        dispatch(orderStatusUpdated(updatedOrder));
      }
    });

    socket.on('order:accepted', () => toast.success('Restaurant accepted your order!'));
    socket.on('order:rejected', (data) => toast.error(`Order rejected: ${data.reason}`));
    socket.on('order:preparing', () => toast.success('Your food is being prepared!'));
    socket.on('order:ready', () => toast.success('Your order is ready for pickup!'));
    socket.on('order:picked_up', () => toast.success('Rider picked up your order!'));
    socket.on('order:out_for_delivery', () => toast.success('Rider is on the way!'));
    socket.on('order:delivered', () => toast.success('Your order has been delivered!'));
    socket.on('order:cancelled', () => toast.error('Your order was cancelled.'));

    // 4. Listen for rider assignment notification
    socket.on('order:rider_assigned', (data) => {
      if (data.orderId === orderId || data.orderId?.toString() === orderId) {
        setAssignedRider({ name: data.riderName, phone: data.riderPhone, vehicle: data.vehicleDetails });
        toast.success(`🏄 ${data.riderName} has been assigned to your order!`, { duration: 5000 });
      }
    });

    // 5. Listen for REAL rider GPS location (replaces simulation)
    socket.on('rider:location', (data) => {
      if (data.orderId === orderId || data.orderId?.toString() === orderId) {
        setRiderGpsPosition({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      socket.off('orderStatusUpdate');
      socket.off('order:accepted');
      socket.off('order:rejected');
      socket.off('order:preparing');
      socket.off('order:ready');
      socket.off('order:picked_up');
      socket.off('order:out_for_delivery');
      socket.off('order:delivered');
      socket.off('order:cancelled');
      socket.off('order:rider_assigned');
      socket.off('rider:location');
      leaveOrderRoom(orderId);
    };
  }, [user, orderId, dispatch]);

  // Timeline position derived from the shared status sequence, so adding a
  // status to the pipeline can't leave this mapping silently out of date.
  const getStepFromStatus = (status) => {
    if (status === ORDER_STATUS.REFUNDED) return ORDER_TIMELINE_SEQUENCE.length - 1;
    const index = ORDER_TIMELINE_SEQUENCE.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (order?.status) {
      setCurrentStep(getStepFromStatus(order.status));
    }
  }, [order?.status]);

  const [isLocationUpdatesActive, setIsLocationUpdatesActive] = useState(true);
  const [driverNotification, setDriverNotification] = useState('');

  // Real GPS position received from WebSocket rider:location event
  const [riderGpsPosition, setRiderGpsPosition] = useState(null);
  // Assigned rider info received from order:rider_assigned event
  const [assignedRider, setAssignedRider] = useState(null);

  // Set initial assigned rider if order is loaded with one
  useEffect(() => {
    if (order?.rider) {
      setAssignedRider({
        name: order.rider.name,
        phone: order.rider.phone,
        vehicle: order.rider.vehicleDetails,
        location: order.rider.currentLocation // might be null
      });
      if (order.rider.currentLocation?.coordinates) {
         setRiderGpsPosition({
            lat: order.rider.currentLocation.coordinates[1],
            lng: order.rider.currentLocation.coordinates[0]
         });
      }
    }
  }, [order?.rider]);

  // Combine base timeline with actual timestamps from statusHistory
  const timelineSteps = BASE_TIMELINE_STEPS.map((step) => {
    const historyItem = order?.statusHistory?.find((h) => h.status === step.status);
    return {
      ...step,
      time: historyItem 
        ? new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Pending',
    };
  });


  const handleDriverAction = (action) => {
    const riderName = assignedRider?.name || 'your rider';
    setDriverNotification(`${action} ${riderName}...`);
    setTimeout(() => setDriverNotification(''), 3000);
  };

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

  // ── No specific order requested: show a picker ──────────────────────────
  // Every branch below keeps the navbar and footer, so the user is never
  // stranded on a bare screen with no navigation.
  if (!orderId) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <TopNavBar />
        <main className="grow w-full max-w-3xl mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg">
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
  }

  if (loading || (!order && !error)) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <TopNavBar />
        <main className="grow flex items-center justify-center flex-col gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-body">Loading order details…</p>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <TopNavBar />
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
  }


  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative">
      <TopNavBar />

      {/* Driver action notification banner */}
      {driverNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-on-primary-container px-6 py-3 rounded-full shadow-lg font-button text-button flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Icon name="phone_in_talk" className="text-primary-container animate-pulse" filled />
          <span>{driverNotification}</span>
        </div>
      )}

      {/* Interactive Simulation Controls Removed */}

      {/* Main Content */}
      <main className="flex-grow w-full max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Order Header & Timeline Column */}
        <div className="lg:col-span-5 flex flex-col gap-stack_lg">
          
          {/* Order Header Info */}
          <div className="bg-surface-container-lowest p-gutter rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-start mb-stack_md">
              <div>
                <h1 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface mb-stack_sm">
                  Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                </h1>
                <p className="font-body text-body text-on-surface-variant">
                  Placed At: <strong>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                </p>
              </div>
              <div className="flex gap-2 items-center">
                {(order.status === ORDER_STATUS.PLACED || order.status === ORDER_STATUS.ACCEPTED) && (
                  <button
                    onClick={() => {
                      // Cancelling is irreversible and money may already be
                      // captured — confirm before firing it.
                      if (window.confirm('Cancel this order? This cannot be undone.')) {
                        dispatch(cancelOrderThunk(order._id));
                      }
                    }}
                    disabled={mutating}
                    // Feedback lives on the button rather than blanking the page.
                    className="text-error border border-error px-3 py-1.5 rounded-full font-label text-label hover:bg-error/10 transition-colors disabled:opacity-50"
                  >
                    {mutating ? 'Cancelling…' : 'Cancel Order'}
                  </button>
                )}
                <div className={`font-label text-label px-3 py-1.5 rounded-full inline-block font-semibold ${getOrderStatusBadgeClass(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </div>
              </div>
            </div>

            {order.status === ORDER_STATUS.REJECTED && (
              <div className="bg-error/10 text-error p-3 rounded-lg mb-stack_md border border-error/20 flex gap-2 items-center">
                <Icon name="error" />
                <span><strong>Order Rejected:</strong> {order.rejectionReason || 'No reason provided.'}</span>
              </div>
            )}
            {order.status === ORDER_STATUS.CANCELLED && (
              <div className="bg-error/10 text-error p-3 rounded-lg mb-stack_md border border-error/20 flex gap-2 items-center">
                <Icon name="cancel" />
                <span><strong>Order Cancelled:</strong> Cancelled by {order.cancelledBy || 'user'}.</span>
              </div>
            )}
            {order.estimatedDeliveryTime && (
              <div className="bg-primary/10 text-primary p-3 rounded-lg mb-stack_md border border-primary/20 flex gap-2 items-center">
                <Icon name="schedule" />
                <span><strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            )}

            <div className="h-px w-full bg-surface-variant my-stack_md"></div>

            {/* Vertical Timeline */}
            <OrderStatusSteps TIMELINE_STEPS={timelineSteps} currentStep={currentStep} />
          </div>

          {/* Order Details Summary */}
          <div className="bg-surface-container-lowest p-gutter rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <h3 className="font-button text-button text-on-surface mb-stack_md font-bold">
              Order Summary
            </h3>
            <div className="flex flex-col gap-stack_sm">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-stack_sm">
                    <span className="font-body text-body text-on-surface-variant">
                      {item.quantity}x
                    </span>
                    <span className="font-body text-body text-on-surface">{item.name}</span>
                  </div>
                  <span className="font-body text-body text-on-surface">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-surface-variant my-stack_md"></div>

            <div className="flex justify-between items-center">
              <span className="font-button text-button text-on-surface font-bold">Total</span>
              <span className="font-button text-button text-on-surface font-bold">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Review Call to Action.
                This compared against 'Delivered' while the API returns
                'DELIVERED', so the prompt could never render and no customer was
                ever asked to review an order. */}
            {order.status === ORDER_STATUS.DELIVERED && !order.isReviewed && (
              <div className="mt-stack_lg p-4 bg-primary/10 rounded-xl border border-primary/20 flex flex-col items-center text-center">
                <Icon name="star" className="text-primary text-[32px] mb-2" />
                <h4 className="font-button text-button font-bold text-on-surface mb-1">How was your food?</h4>
                <p className="font-body text-small text-secondary mb-4">Rate your order to help others!</p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-6 py-2 bg-primary text-on-primary font-button text-button rounded-full shadow-sm hover:opacity-90 transition-opacity w-full"
                >
                  Leave a Review
                </button>
              </div>
            )}
            
            {order.isReviewed && (
              <div className="mt-stack_lg p-4 bg-surface-variant rounded-xl flex items-center gap-3 text-center justify-center text-on-surface-variant">
                <Icon name="stars" className="text-[#F59E0B]" />
                <span className="font-label text-label font-bold">You reviewed this order</span>
              </div>
            )}
          </div>
        </div>

        {/* Map & Driver Info Column */}
        <div className="lg:col-span-7 flex flex-col gap-stack_lg">
          {/* Map Container */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-[500px] lg:h-full relative">
            {/* Map Area */}
            {order?.status === ORDER_STATUS.OUT_FOR_DELIVERY ? (
              <LiveTracker
                orderId={order._id}
                restaurantLocation={order?.restaurant?.location}
                customerLocation={order?.deliveryAddress}
                initialRiderLocation={riderGpsPosition}
                isRiderView={false}
              />
            ) : (
              <OrderMap 
                restaurantLocation={order?.restaurant?.location}
                customerLocation={order?.deliveryAddress}
                riderLocation={riderGpsPosition}
                restaurantName={order?.restaurant?.name}
              />
            )}

            {/* Driver Details Floating Card */}
            <DeliveryDetails
              handleDriverAction={handleDriverAction}
              setIsLocationUpdatesActive={setIsLocationUpdatesActive}
              isLocationUpdatesActive={isLocationUpdatesActive}
              rider={assignedRider}
            />
          </div>
        </div>

      </main>

      <HomeFooter />

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          order={order}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            // Re-fetch order to get updated isReviewed status
            dispatch(fetchOrderByIdThunk(orderId));
          }}
        />
      )}
    </div>
  );
};

export default TrackOrderPage;
