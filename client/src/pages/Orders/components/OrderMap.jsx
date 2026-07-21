import React from 'react';

const OrderMap = ({ currentStep, driverPosition }) => {
  return (
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
  );
};

export default OrderMap;
