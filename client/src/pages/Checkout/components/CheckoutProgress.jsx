import React from 'react';

const CheckoutProgress = () => {
  return (
    <div className="flex items-center justify-center mb-stack_lg gap-4 md:gap-12">
      <div className="flex items-center gap-2 step-active">
        <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small border-primary text-primary">
          1
        </span>
        <span className="font-label text-label hidden sm:inline text-primary">Details & Delivery</span>
      </div>
      <div className="h-px w-8 md:w-16 bg-outline-variant"></div>
      <div className="flex items-center gap-2 text-secondary">
        <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small">
          2
        </span>
        <span className="font-label text-label hidden sm:inline">Payment Option</span>
      </div>
      <div className="h-px w-8 md:w-16 bg-outline-variant"></div>
      <div className="flex items-center gap-2 text-secondary opacity-50">
        <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small">
          3
        </span>
        <span className="font-label text-label hidden sm:inline">Confirmation</span>
      </div>
    </div>
  );
};

export default CheckoutProgress;
