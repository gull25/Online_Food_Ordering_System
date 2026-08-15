import React, { useState, useEffect } from 'react';
import Icon from '../../components/common/Icon';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderByIdThunk } from '../../redux/orderSlice';

import OrderMap from '../../components/homeScreen/orderComponents/OrderMap';
import LiveTracker from '../../components/homeScreen/orderComponents/LiveTracker';
import DeliveryDetails from '../../components/homeScreen/orderComponents/DeliveryDetails';
import ReviewModal from '../../components/homeScreen/orderComponents/ReviewModal';
import OrderPicker from '../../components/homeScreen/orderComponents/OrderPicker';
import OrderErrorFallback from '../../components/homeScreen/orderComponents/OrderErrorFallback';
import OrderSummary from '../../components/homeScreen/orderComponents/OrderSummary';
import OrderHeader from '../../components/homeScreen/orderComponents/OrderHeader';

import { ORDER_STATUS, ORDER_TIMELINE_SEQUENCE } from '../../constants/orderStatus';
import { ORDER_TIMELINE_STEPS } from '../../data/orderTimelineData';
import { useOrderData } from '../../hooks/useOrderData';
import { useOrderSocket } from '../../hooks/useOrderSocket';

const TrackOrderPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // 1. Data Fetching & Routing Hook
  const { orderId, order, loading, mutating, error, trackableOrders } = useOrderData();

  // 2. WebSocket & Real-Time Hook
  const {
    riderGpsPosition,
    assignedRider,
    driverNotification,
    handleDriverAction,
    isLocationUpdatesActive,
    setIsLocationUpdatesActive,
    reviewItem,
    setReviewItem
  } = useOrderSocket(orderId, user, order, dispatch);

  // Calculate current step from status
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

  // Combine base timeline with actual timestamps from statusHistory
  const timelineSteps = ORDER_TIMELINE_STEPS.map((step) => {
    const historyItem = order?.statusHistory?.find((h) => h.status === step.status);
    return {
      ...step,
      time: historyItem
        ? new Date(historyItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Pending',
    };
  });

  // No specific order requested: show order picker
  if (!orderId) {
    return <OrderPicker loading={loading} trackableOrders={trackableOrders} />;
  }

  if (loading || (!order && !error)) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <main className="grow flex items-center justify-center flex-col gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-body">Loading order details…</p>
        </main>
              </div>
    );
  }

  if (error || !order) {
    return <OrderErrorFallback error={error} />;
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col relative">

      {/* Driver action notification banner */}
      {driverNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-surface-container-highest border border-surface-variant text-on-surface px-6 py-3 rounded-full shadow-lg font-button text-button flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Icon name="phone_in_talk" className="text-primary animate-pulse" filled />
          <span>{driverNotification}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow w-full max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg grid grid-cols-1 lg:grid-cols-12 gap-gutter">

        {/* Order Header & Timeline Column */}
        <div className="lg:col-span-5 flex flex-col gap-stack_lg">
          
          <OrderHeader 
            order={order} 
            mutating={mutating} 
            dispatch={dispatch} 
            timelineSteps={timelineSteps} 
            currentStep={currentStep} 
          />

          {/* Order Details Summary */}
          <OrderSummary order={order} setReviewItem={setReviewItem} />
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

      
      {/* Review Modal */}
      {reviewItem && (
        <ReviewModal
          order={order}
          orderItem={reviewItem}
          onClose={() => setReviewItem(null)}
          onSuccess={() => {
            dispatch(fetchOrderByIdThunk(order._id));
            setReviewItem(null);
          }}
        />
      )}
    </div>
  );
};

export default TrackOrderPage;
