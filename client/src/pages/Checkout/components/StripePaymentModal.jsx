import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePaymentModal = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setError('');

    // Confirm the payment
    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // We handle success locally without redirecting immediately
    });

    if (submitError) {
      setError(submitError.message);
      setIsProcessing(false);
    } else {
      // Payment succeeded!
      setIsProcessing(false);
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-h3 text-h3 font-bold text-on-surface">Payment Details</h2>
            <p className="font-body text-body text-secondary mt-1">
              Complete your purchase securely via Stripe.
            </p>
          </div>
          <button 
            onClick={onCancel}
            disabled={isProcessing}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/20 flex justify-between items-center">
          <span className="font-label text-label text-on-surface uppercase tracking-wide">Total to Pay</span>
          <span className="font-h3 text-h3 font-bold text-primary">${amount.toFixed(2)}</span>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container text-small font-label p-3 rounded-lg mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full h-14 bg-primary text-white font-button text-button rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">lock</span>
                <span>Pay ${amount.toFixed(2)}</span>
              </>
            )}
          </button>

          <p className="text-center font-small text-[10px] text-secondary mt-4 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[12px]">verified_user</span>
            Secured by Stripe
          </p>
        </form>

      </div>
    </div>
  );
};

export default StripePaymentModal;
