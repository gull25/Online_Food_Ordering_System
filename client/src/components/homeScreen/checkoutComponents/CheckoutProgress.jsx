import React from 'react';

import Icon from '../../common/Icon';
const CheckoutProgress = ({ currentStep = 1 }) => {
  return (
    <div className="flex items-center justify-center mb-stack_lg gap-4 md:gap-12">
      {/* Step 1 */}
      <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'step-active' : ''}`}>
        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small ${currentStep >= 1 ? 'border-primary text-primary' : 'border-outline-variant text-secondary'}`}>
          {currentStep > 1 ? <Icon name="check" className="text-[16px]" /> : '1'}
        </span>
        <span className={`font-label text-label hidden sm:inline ${currentStep >= 1 ? 'text-primary' : 'text-secondary'}`}>Details & Delivery</span>
      </div>
      
      <div className={`h-px w-8 md:w-16 ${currentStep >= 2 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
      
      {/* Step 2 */}
      <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'step-active' : ''}`}>
        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small ${currentStep >= 2 ? 'border-primary text-primary' : 'border-outline-variant text-secondary'}`}>
          {currentStep > 2 ? <Icon name="check" className="text-[16px]" /> : '2'}
        </span>
        <span className={`font-label text-label hidden sm:inline ${currentStep >= 2 ? 'text-primary' : 'text-secondary'}`}>Payment Option</span>
      </div>
      
      <div className={`h-px w-8 md:w-16 ${currentStep >= 3 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
      
      {/* Step 3 */}
      <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'step-active' : 'opacity-50'}`}>
        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-small ${currentStep >= 3 ? 'border-primary text-primary' : 'border-outline-variant text-secondary'}`}>
          3
        </span>
        <span className={`font-label text-label hidden sm:inline ${currentStep >= 3 ? 'text-primary' : 'text-secondary'}`}>Confirmation</span>
      </div>
    </div>
  );
};

export default CheckoutProgress;
