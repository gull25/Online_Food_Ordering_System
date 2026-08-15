import React from 'react';

import Icon from '../../common/Icon';
const FlashSaleBanner = ({ formattedTime, copyPromoCode, copiedCode, offer }) => {
  // Render nothing without a real offer.
  if (!offer?.code) return null;

  const bgImage = offer.image && offer.image !== 'no-photo.jpg'
    ? offer.image
    : "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80";

  const title = offer.title || 'Limited Time Deal';
  const description = offer.description || 'Save on your next order from this restaurant.';
  const promoCode = offer.code;
  const discountText = offer.discountPercentage
    ? `(${offer.discountPercentage}% Off)`
    : '';

  return (
    <section className="relative w-full rounded-[32px] overflow-hidden mb-stack_lg min-h-[400px] flex items-center shadow-md bg-surface-container">
      <img
        src={bgImage}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent"></div>
      <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
        <div className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full font-label text-label mb-4 animate-pulse">
          <Icon name="bolt" className="text-[16px]" />
          FLASH SALE
        </div>
        <h1 className="font-h1 text-h1-mobile md:text-h1 mb-4 leading-tight text-balance">{title}</h1>
        <p className="font-body text-body text-white/90 mb-8 max-w-md">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* React-based Countdown Display */}
          <div className="flex gap-4" id="countdown">
            <div className="flex flex-col items-center">
              <span className="text-h2 font-h2">{formattedTime.hours}</span>
              <span className="font-label text-[12px] uppercase opacity-70">Hours</span>
            </div>
            <span className="text-h2 font-h2">:</span>
            <div className="flex flex-col items-center">
              <span className="text-h2 font-h2">{formattedTime.minutes}</span>
              <span className="font-label text-[12px] uppercase opacity-70">Mins</span>
            </div>
            <span className="text-h2 font-h2">:</span>
            <div className="flex flex-col items-center">
              <span className="text-h2 font-h2">{formattedTime.seconds}</span>
              <span className="font-label text-[12px] uppercase opacity-70">Secs</span>
            </div>
          </div>
          <button
            onClick={() => copyPromoCode(promoCode)}
            className="bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-button hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
          >
            <Icon name="confirmation_number" />
            {copiedCode === promoCode ? 'Code Copied!' : `Claim Flash Deal ${discountText}`}
          </button>
        </div>
      </div>
    </section>
  );
};

export default FlashSaleBanner;
