import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrderByIdThunk } from '../../features/orders/orderSlice';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import OrderStatusSteps from './components/OrderStatusSteps';
import OrderMap from './components/OrderMap';
import DeliveryDetails from './components/DeliveryDetails';
import ReviewModal from './components/ReviewModal';
import { socket, connectSocket, disconnectSocket } from '../../utils/socket';
import { setCurrentOrder } from '../../features/orders/orderSlice';

const TIMELINE_STEPS = [
  {
    title: 'Order Placed',
    description: "We've received your order.",
    time: '8:05 PM',
    icon: 'check',
  },
  {
    title: 'Preparing Food',
    description: 'The kitchen is preparing your meal.',
    time: '8:15 PM',
    icon: 'check',
  },
  {
    title: 'Out For Delivery',
    description: 'Your driver is on the way.',
    time: '8:30 PM',
    icon: 'two_wheeler',
  },
  {
    title: 'Delivered',
    description: 'Enjoy your meal!',
    time: '8:45 PM',
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
      dispatch(fetchOrderByIdThunk(orderId));
    }
  }, [dispatch, orderId]);

  // WebSocket Integration for Real-Time Status Updates
  useEffect(() => {
    if (user && user._id) {
      connectSocket(user._id);

      socket.on('orderStatusUpdate', (updatedOrder) => {
        // If the update is for the currently viewed order
        if (updatedOrder._id === orderId) {
          dispatch(setCurrentOrder(updatedOrder));
        }
      });

      return () => {
        socket.off('orderStatusUpdate');
        // We can optionally disconnect the socket entirely here, or leave it alive.
        // For now, we'll leave it alive but remove the listener to prevent memory leaks.
      };
    }
  }, [user, orderId, dispatch]);

  // Derived state for timeline step based on actual order status
  const getStepFromStatus = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Preparing': return 1;
      case 'Out for Delivery': return 2;
      case 'Delivered': return 3;
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
  const [driverPosition, setDriverPosition] = useState({ top: '50%', left: '50%' });

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Simulate Driver coordinates moving slightly if location updates are active
  useEffect(() => {
    if (!isLocationUpdatesActive) return;
    const interval = setInterval(() => {
      const offsetTop = (Math.random() - 0.5) * 4; // slight jitter
      const offsetLeft = (Math.random() - 0.5) * 4;
      setDriverPosition({
        top: `calc(50% + ${offsetTop}px)`,
        left: `calc(50% + ${offsetLeft}px)`,
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isLocationUpdatesActive]);

  const handleDriverAction = (action) => {
    setDriverNotification(`${action} Alex Mercer...`);
    setTimeout(() => setDriverNotification(''), 3000);
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <p className="text-error">{error || 'Order not found.'}</p>
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

      {/* Interactive Simulation Controls */}
      <div className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop pt-stack_md w-full">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">motion_photos_on</span>
            <span className="font-button text-small text-on-surface">
              Order Status Simulator:
            </span>
          </div>
          <div className="flex gap-2">
            {TIMELINE_STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  currentStep === idx
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white border-surface-variant text-on-surface hover:bg-surface-variant'
                }`}
              >
                Step {idx + 1}: {step.title}
              </button>
            ))}
          </div>
        </div>
      </div>

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
            <OrderStatusSteps TIMELINE_STEPS={TIMELINE_STEPS} currentStep={currentStep} />
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
            <OrderMap currentStep={currentStep} driverPosition={driverPosition} />

            {/* Driver Details Floating Card */}
            <DeliveryDetails
              handleDriverAction={handleDriverAction}
              setIsLocationUpdatesActive={setIsLocationUpdatesActive}
              isLocationUpdatesActive={isLocationUpdatesActive}
            />
          </div>
        </div>

      </main>

      <Footer />

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
