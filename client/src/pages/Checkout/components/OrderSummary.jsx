import React from 'react';

const OrderSummary = ({ subtotal, discountAmount, discountPercent, serviceFee, tax, total, promoInput, setPromoInput, handleApplyPromo, promoMessage }) => {
  return (
    <>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-body">
          <span className="text-secondary">Subtotal</span>
          <span className="text-on-surface">${subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-body text-tertiary font-medium">
            <span>Discount ({discountPercent}%)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-body">
          <span className="text-secondary">Delivery Fee</span>
          <span className="text-tertiary font-semibold">FREE</span>
        </div>
        <div className="flex justify-between text-body">
          <span className="text-secondary">Service Fee</span>
          <span className="text-on-surface">${serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-body">
          <span className="text-secondary">Tax (8.7%)</span>
          <span className="text-on-surface">${tax.toFixed(2)}</span>
        </div>
      </div>

      {/* Promo input code */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2 p-1 border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low">
          <input
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            className="flex-grow px-3 py-2 bg-transparent focus:outline-none font-label text-label outline-none font-body"
            placeholder="Promo code (e.g. HELLO50)"
            type="text"
          />
          <button
            onClick={handleApplyPromo}
            className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-button text-small hover:bg-on-secondary-fixed-variant transition-colors"
          >
            Apply
          </button>
        </div>
        {promoMessage && (
          <span
            className={`text-xs px-2 font-medium ${
              discountPercent > 0 ? 'text-tertiary' : 'text-error'
            }`}
          >
            {promoMessage}
          </span>
        )}
      </div>

      <div className="border-t border-outline-variant pt-4 mb-8">
        <div className="flex justify-between items-baseline">
          <span className="font-h3 text-h3 font-bold text-on-surface">Total</span>
          <span className="text-primary-container font-h2 text-h2-mobile md:text-h2 font-extrabold">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </>
  );
};

export default OrderSummary;
