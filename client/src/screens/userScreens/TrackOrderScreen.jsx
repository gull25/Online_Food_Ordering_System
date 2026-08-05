import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderByIdThunk } from '../../redux/orderSlice';
import TopNavBar from '../../components/layout/Navbar';
import HomeFooter from '../../components/homeScreen/homeScreenComponents/HomeFooter';
import OrderStatusSteps from '../../components/homeScreen/orderComponents/OrderStatusSteps';
import OrderMap from '../../components/homeScreen/orderComponents/OrderMap';
import DeliveryDetails from '../../components/homeScreen/orderComponents/DeliveryDetails';
import ReviewModal from '../../components/homeScreen/orderComponents/ReviewModal';
import { socket, connectSocket, joinOrderRoom, leaveOrderRoom } from '../../helper/socket';
import { setCurrentOrder } from '../../redux/orderSlice';
import { toast } from 'react-hot-toast';

const BASE_TIMELINE_STEPS = [
  {
    status: 'Pending',
    title: 'Order Placed',
    description: "We've received your order.",
    icon: 'check',
  },
  {
    status: 'Preparing',
    title: 'Preparing Food',
    description: 'The kitchen is preparing your meal.',
    icon: 'restaurant_menu',
  },
  {
    status: 'Ready',
    title: 'Ready',
    description: 'Your order is ready to be picked up.',
    icon: 'done_all',
  },
  {
    status: 'Out For Delivery',
    title: 'Out For Delivery',
    description: 'Your driver is on the way.',
    icon: 'two_wheeler',
  },
  {
    status: 'Delivered',
    title: 'Delivered',
    description: 'Enjoy your meal!',
    icon: 'home',
  },
];

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const dispatch = useDispatch();

  const { currentOrder: order, loading, error } = useSelector((state) => state.orders);
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
        dispatch(setCurrentOrder(updatedOrder));
      }
    });

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
      socket.off('order:rider_assigned');
      socket.off('rider:location');
      leaveOrderRoom(orderId);
    };
  }, [user, orderId, dispatch]);

  // Derived state for timeline step based on actual order status
  const getStepFromStatus = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Preparing': return 1;
      case 'Ready': return 2;
      case 'Out For Delivery': return 3;
      case 'Delivered': return 4;
      case 'Completed': return 4;
      case 'Cancelled': return 0; // Or handle differently
      default: return 0;
    }
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

  if (loading || (!order && orderId && !error)) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-body">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-error">{error || 'Order not found. Please check your order ID.'}</p>
      </div>
    );
  }


  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative">
      <TopNavBar />

      {/* Driver action notification banner */}
      {driverNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-on-primary-container px-6 py-3 rounded-full shadow-lg font-button text-button flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined fill text-primary-container animate-pulse">
            phone_in_talk
          </span>
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
              <div className="bg-primary-container text-on-primary font-label text-label px-3 py-1.5 rounded-full inline-block font-semibold shadow-sm">
                {order.status}
              </div>
            </div>

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

            {/* Review Call to Action */}
            {order.status === 'Delivered' && !order.isReviewed && (
              <div className="mt-stack_lg p-4 bg-primary/10 rounded-xl border border-primary/20 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-primary text-[32px] mb-2">star</span>
                <h4 className="font-button text-button font-bold text-on-surface mb-1">How was your food?</h4>
                <p className="font-body text-small text-secondary mb-4">Rate your order to help others!</p>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-6 py-2 bg-primary text-white font-button text-button rounded-full shadow-sm hover:opacity-90 transition-opacity w-full"
                >
                  Leave a Review
                </button>
              </div>
            )}
            
            {order.isReviewed && (
              <div className="mt-stack_lg p-4 bg-surface-variant rounded-xl flex items-center gap-3 text-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[#F59E0B]">stars</span>
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
            <OrderMap 
              restaurantLocation={order?.restaurant?.location}
              customerLocation={order?.deliveryAddress}
              riderLocation={riderGpsPosition}
              restaurantName={order?.restaurant?.name}
            />

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
