import React, { useState, useEffect } from 'react';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

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
            <div className="relative pt-stack_sm flex flex-col gap-y-8">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const isActive = idx === currentStep;
                const isUpcoming = idx > currentStep;
                const isLast = idx === TIMELINE_STEPS.length - 1;

                return (
                  <div key={idx} className="timeline-item relative flex gap-stack_md">
                    {/* Vertical Connector Line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[11px] top-6 w-[2px] h-[calc(100%+32px)] z-0 transition-colors duration-500 ${
                          isCompleted ? 'bg-primary' : 'bg-surface-variant'
                        }`}
                      />
                    )}

                    {/* Indicator Circle */}
                    <div
                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm transition-all duration-500 ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : isActive
                          ? 'border-2 border-primary bg-surface-container-lowest text-primary'
                          : 'border-2 border-surface-variant bg-surface-container-lowest text-secondary'
                      }`}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-[14px] font-bold">
                          check
                        </span>
                      ) : isActive ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                      ) : null}
                    </div>

                    {/* Step description content */}
                    <div className={`flex-grow transition-opacity duration-500 ${isUpcoming ? 'opacity-50' : 'opacity-100'}`}>
                      <h3
                        className={`font-button text-button ${
                          isActive ? 'text-primary font-bold' : 'text-on-surface'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="font-small text-small text-on-surface-variant mt-1">
                        {step.description}
                      </p>
                    </div>

                    <div className={`text-right transition-opacity duration-500 ${isUpcoming ? 'opacity-50' : 'opacity-100'}`}>
                      <span
                        className={`font-small text-small ${
                          isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
                        }`}
                      >
                        {isUpcoming ? 'Pending' : step.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
            <div className="flex-grow w-full relative bg-surface-container-low min-h-[300px]">
              {/* Simulated Map Background */}
              <div
                className="absolute inset-0 bg-cover bg-center w-full h-full"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7ncUelo04xg3FqSynPFOc3_7ZtnznbFkHIn0vKpX0ZUrI-m8XC1PRRJ5I_DjpDB8xQ3mo7mITOt5KUP5JagYh8U_Suorrnj8w2S9V4N5K6OqeoV7FosuOWWJCxPkMXOhsUb8KxcqLR9PxoBsail0K5HPjnk-e4uJQVR6EFmzU7OrH_cuCP_XoDw29eiNoNwwTJ9_uVTFlAa4XuIpilgGFFCVbHmVVF2TNCtegjkHA4OlpN5ZSPSr9CQ')",
                }}
              ></div>

              {/* Restaurant Pin */}
              <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-surface-container-lowest p-2 rounded-lg shadow-md mb-1 whitespace-nowrap border border-surface-variant">
                  <span className="font-label text-label text-on-surface">Burger Joint</span>
                </div>
                <div className="w-8 h-8 bg-on-surface text-surface-container-lowest rounded-full flex items-center justify-center shadow-lg border-2 border-surface-container-lowest">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>
                    restaurant
                  </span>
                </div>
              </div>

              {/* Destination Pin */}
              <div className="absolute bottom-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-8 h-8 bg-surface-container-lowest text-primary rounded-full flex items-center justify-center shadow-lg border-2 border-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    home
                  </span>
                </div>
              </div>

              {/* Driver Pin (Simulated real-time motion) */}
              {currentStep === 2 && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-1000 ease-out"
                  style={{
                    top: driverPosition.top,
                    left: driverPosition.left,
                  }}
                >
                  <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg border-2 border-surface-container-lowest animate-pulse">
                    <span className="material-symbols-outlined fill text-white" style={{ fontSize: '20px' }}>
                      two_wheeler
                    </span>
                  </div>
                </div>
              )}

              {/* Route Line (Decorative SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <path
                  className="opacity-60"
                  d="M 330 180 Q 500 220 500 350 T 750 420"
                  fill="none"
                  stroke="#ae3200"
                  strokeDasharray="8,8"
                  strokeWidth="4"
                ></path>
              </svg>
            </div>

            {/* Driver Details Floating Card */}
            <div className="bg-surface-container-lowest p-stack_md border-t border-surface-variant relative z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-stack_md">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-surface-variant shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt="Driver Alex Mercer headshot"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSb0ftdU-tOkV99ObIS0SG-_KEM-BQNVb4zAVkuY4xHoz4-5mQdzEM4LRXtlEsT4O4Tvs7siMplKezRvqifvlwjqtt9AOEDcmL4pBFOSHlokGaGtNU7-vnH0ywqX854MuTxbCzJISTn2c8FdDmDVQXUohwwdfhrzVsfiDF2MXpPXhG2BaE_i37uTMHMZV2VUa7JFFTy3ZNqVdHj5VNP3mghtYmXBe4fGWePNzYAqTjUw-ANWcKHWDsZA"
                    />
                  </div>
                  <div>
                    <h4 className="font-button text-button text-on-surface font-semibold">
                      Alex Mercer
                    </h4>
                    <div className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined fill text-xs">star</span>
                      <span className="font-label text-label">4.9</span>
                      <span className="font-small text-small text-on-surface-variant ml-1">
                        (2.1k deliveries)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-stack_sm">
                  <button
                    onClick={() => handleDriverAction('Opening chat with')}
                    aria-label="Chat with driver"
                    className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined">chat</span>
                  </button>
                  <button
                    onClick={() => handleDriverAction('Calling')}
                    aria-label="Call driver"
                    className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined">call</span>
                  </button>
                </div>
              </div>
              <div className="mt-stack_md">
                <button
                  onClick={() => setIsLocationUpdatesActive(!isLocationUpdatesActive)}
                  className={`w-full h-12 rounded-lg font-button text-button transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isLocationUpdatesActive
                      ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${
                      isLocationUpdatesActive ? 'animate-spin' : ''
                    }`}
                  >
                    my_location
                  </span>
                  {isLocationUpdatesActive
                    ? 'Live Location Updates Active'
                    : 'Location Updates Paused'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default TrackOrderPage;
