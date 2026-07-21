import React from 'react';

const PaymentMethods = ({ paymentMethod, setPaymentMethod }) => {
  return (
    <div className="mb-8">
      <h4 className="font-bold text-body mb-4 text-on-surface">Payment Method</h4>
      <div className="space-y-3">
        <label
          onClick={() => setPaymentMethod('visa')}
          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
            paymentMethod === 'visa'
              ? 'border-primary bg-surface-container-low'
              : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">credit_card</span>
            <div>
              <p className="font-bold text-small text-on-surface">Visa ending in 4421</p>
              <p className="text-secondary text-[10px]">Exp 09/26</p>
            </div>
          </div>
          <input
            checked={paymentMethod === 'visa'}
            onChange={() => setPaymentMethod('visa')}
            className="w-5 h-5 text-primary border-outline focus:ring-primary accent-primary"
            name="payment"
            type="radio"
          />
        </label>

        <label
          onClick={() => setPaymentMethod('apple')}
          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
            paymentMethod === 'apple'
              ? 'border-primary bg-surface-container-low'
              : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center gap-3">
            <img
              alt="Apple Pay"
              className="h-4 w-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLcq3l5FEeVSxHCZwmeMz0s37FxVe9xHLFxaIzyWsSFHgGrPR2xef9W-QEarzqGyduN06KkYhmXsEJJZhUycq_cLf4cfFgeLX7fLSQy4KS_CqaLtut6sSyAX4RglBHUX4PgGRj4XjISuEnULd4lgC9t5JrAEz61_ZlQZqD4o3cwf6BKOwgGjYyT3VgGePd37amYWvhoWmhgjMhwbHo-YKxA6ACvS7M4W5d9LPSTKaaQ2kqDjOVDvFQLQ"
            />
            <span className="font-bold text-small text-on-surface">Apple Pay</span>
          </div>
          <input
            checked={paymentMethod === 'apple'}
            onChange={() => setPaymentMethod('apple')}
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
          <span className="material-symbols-outlined text-sm">add_circle</span>
          <span className="font-button text-small">Add New Method</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentMethods;
