import React from 'react';

const DeliveryDetails = ({ handleDriverAction, setIsLocationUpdatesActive, isLocationUpdatesActive, rider }) => {
  return (
    <div className="bg-surface-container-lowest p-stack_md border-t border-surface-variant relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-stack_md">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-surface-variant shrink-0 bg-surface-variant flex justify-center items-center">
            {rider ? (
              <span className="material-symbols-outlined text-secondary text-2xl">account_circle</span>
            ) : (
              <span className="material-symbols-outlined text-secondary animate-pulse text-2xl">two_wheeler</span>
            )}
          </div>
          <div>
            <h4 className="font-button text-button text-on-surface font-semibold">
              {rider ? rider.name : 'Waiting for rider...'}
            </h4>
            <div className="flex items-center gap-1 text-primary">
              <span className="font-label text-label">{rider ? rider.vehicle || 'Rider on the way' : 'Assigning...'}</span>
            </div>
            {rider?.phone && (
              <p className="font-small text-small text-on-surface-variant mt-0.5">
                {rider.phone}
              </p>
            )}
          </div>
        </div>
        
        {rider && (
          <div className="flex gap-stack_sm">
            <button
              onClick={() => handleDriverAction('Opening chat with')}
              aria-label="Chat with driver"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">chat</span>
            </button>
            <button
              onClick={() => handleDriverAction('Calling')}
              aria-label="Call driver"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">call</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-stack_md">
        <button
          onClick={() => setIsLocationUpdatesActive(!isLocationUpdatesActive)}
          className={`w-full h-12 rounded-lg font-button text-button transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
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
