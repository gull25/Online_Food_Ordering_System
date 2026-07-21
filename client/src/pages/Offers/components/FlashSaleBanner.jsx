import React from 'react';

const FlashSaleBanner = ({ formattedTime, copyPromoCode, copiedCode }) => {
  return (
    <section className="relative w-full rounded-[32px] overflow-hidden mb-stack_lg min-h-[400px] flex items-center shadow-md">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80')",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent"></div>
      <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
        <div className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full font-label text-label mb-4 animate-pulse">
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          FLASH SALE
        </div>
        <h1 className="font-h1 text-h1-mobile md:text-h1 mb-4 leading-tight">Today's Top Deals</h1>
        <p className="font-body text-body text-white/90 mb-8 max-w-md">
          Satisfy your cravings for less. Exclusive discounts on the city's finest restaurants, only for the next few hours.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* React-based Countdown Display */}
          <div className="flex gap-4" id="countdown">
            <div className="flex flex-col items-center">
              <span className="text-h2 font-h2">{formattedTime.hours}</span>
              <span className="font-label text-[10px] uppercase opacity-70">Hours</span>
            </div>
            <span className="text-h2 font-h2">:</span>
            <div className="flex flex-col items-center">
              <span className="text-h2 font-h2">{formattedTime.minutes}</span>
              <span className="font-label text-[10px] uppercase opacity-70">Mins</span>
            </div>
            <span className="text-h2 font-h2">:</span>
            <div className="flex flex-col items-center">
              <span className="text-h2 font-h2">{formattedTime.seconds}</span>
              <span className="font-label text-[10px] uppercase opacity-70">Secs</span>
            </div>
          </div>
          <button
            onClick={() => copyPromoCode('FLASH80')}
            className="bg-primary-container text-white px-8 py-4 rounded-xl font-button text-button hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
          >
            <span className="material-symbols-outlined">confirmation_number</span>
            {copiedCode === 'FLASH80' ? 'Code Copied!' : 'Claim Flash Deal (80% Off)'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
