import React from 'react';

import Icon from '../../common/Icon';
const PaymentMethods = ({ paymentMethod, setPaymentMethod }) => {
  return (
    <div className="mb-8">
      <h4 className="font-bold text-body mb-4 text-on-surface">Payment Method</h4>
      <div className="space-y-3">
        <label
          onClick={() => setPaymentMethod('stripe')}
          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'stripe'
              ? 'border-primary bg-surface-container-low'
              : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon name="credit_card" className="text-secondary" />
            <div>
              <p className="font-bold text-small text-on-surface">Credit / Debit Card</p>
              <p className="text-secondary text-[12px]">Powered by Stripe</p>
            </div>
          </div>
          <input
            checked={paymentMethod === 'stripe'}
            onChange={() => setPaymentMethod('stripe')}
            className="w-5 h-5 text-primary border-outline focus:ring-primary accent-primary"
            name="payment"
            type="radio"
          />
        </label>

        <label
          onClick={() => setPaymentMethod('easypaisa')}
          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'easypaisa'
              ? 'border-primary bg-surface-container-low'
              : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon name="phone_iphone" className="text-secondary" />
            <span className="font-bold text-small text-on-surface">Easypaisa</span>
          </div>
          <input
            checked={paymentMethod === 'easypaisa'}
            onChange={() => setPaymentMethod('easypaisa')}
            className="w-5 h-5 text-primary border-outline focus:ring-primary accent-primary"
            name="payment"
            type="radio"
          />
        </label>

        <label
          onClick={() => setPaymentMethod('jazzcash')}
          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'jazzcash'
              ? 'border-primary bg-surface-container-low'
              : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon name="phone_iphone" className="text-secondary" />
            <span className="font-bold text-small text-on-surface">JazzCash</span>
          </div>
          <input
            checked={paymentMethod === 'jazzcash'}
            onChange={() => setPaymentMethod('jazzcash')}
            className="w-5 h-5 text-primary border-outline focus:ring-primary accent-primary"
            name="payment"
            type="radio"
          />
        </label>

        <label
          onClick={() => setPaymentMethod('cod')}
          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod'
              ? 'border-primary bg-surface-container-low'
              : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon name="payments" className="text-secondary" />
            <span className="font-bold text-small text-on-surface">Cash on Delivery</span>
          </div>
          <input
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
            className="w-5 h-5 text-primary border-outline focus:ring-primary accent-primary"
            name="payment"
            type="radio"
          />
        </label>

        <button
          type="button"
          onClick={() => alert('Adding new payment methods is coming soon!')}
          className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-outline-variant rounded-xl text-secondary hover:text-primary hover:border-primary transition-all group"
        >
          <Icon name="add_circle" className="text-sm" />
          <span className="font-button text-small">Add New Method</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentMethods;
