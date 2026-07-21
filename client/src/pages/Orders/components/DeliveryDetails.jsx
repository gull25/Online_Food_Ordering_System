import React from 'react';

const DeliveryDetails = ({ handleDriverAction, setIsLocationUpdatesActive, isLocationUpdatesActive }) => {
  return (
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
  );
};

export default DeliveryDetails;
