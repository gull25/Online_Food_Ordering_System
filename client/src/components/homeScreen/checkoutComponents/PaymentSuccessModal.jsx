import React from 'react';
import Icon from '../../common/Icon';

const PaymentSuccessModal = ({ handleContinueAfterSuccess }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
          <Icon name="check_circle" className="text-5xl" />
        </div>
        <h2 className="font-h3 text-h3 font-bold text-on-surface mb-2">Payment Successful!</h2>
        <p className="font-body text-body text-secondary mb-8">
          Your order has been securely placed and payment is confirmed.
        </p>
        <button
          onClick={handleContinueAfterSuccess}
          className="w-full h-14 bg-primary text-on-primary font-button text-button rounded-xl hover:opacity-90 transition-opacity shadow-lg"
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
