import React, { useState, useEffect } from 'react';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import OrderStatusSteps from './components/OrderStatusSteps';
import OrderMap from './components/OrderMap';
import DeliveryDetails from './components/DeliveryDetails';

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

const ORDER_ITEMS = [
  { name: 'Truffle Mushroom Burger', quantity: 1, price: 18.50 },
  { name: 'Sweet Potato Fries', quantity: 2, price: 12.00 },
];

const TrackOrderPage = () => {
  const [currentStep, setCurrentStep] = useState(2); // Default to Out for Delivery (Step 2)
  const [isLocationUpdatesActive, setIsLocationUpdatesActive] = useState(true);
  const [driverNotification, setDriverNotification] = useState('');
  const [driverPosition, setDriverPosition] = useState({ top: '50%', left: '50%' });

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
                  Order #849201
                </h1>
                <p className="font-body text-body text-on-surface-variant">
                  Estimated Delivery: <strong>8:45 PM</strong>
                </p>
              </div>
              <div className="bg-primary-container text-on-primary font-label text-label px-3 py-1.5 rounded-full inline-block font-semibold shadow-sm">
                {currentStep === 3 ? 'Delivered' : currentStep === 2 ? 'In Transit' : 'Processing'}
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
              {ORDER_ITEMS.map((item, idx) => (
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
                $
                {ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </span>
            </div>
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
    </div>
  );
};

export default TrackOrderPage;
