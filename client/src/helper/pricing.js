/**
 * Order pricing — the client-side mirror of `server/src/utils/pricing.js`.
 */

export const TAX_RATE = 0.087;
export const SERVICE_FEE = 2.5;

/** Rounds to whole cents without the `0.1 + 0.2` class of drift. */
export const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/** The price of one unit, including its chosen size and add-ons. */
export const unitPrice = (item) =>
  item.price +
  (item.selectedSize?.additionalPrice ?? 0) +
  (item.selectedAddOns ?? []).reduce((sum, addOn) => sum + addOn.price, 0);
export const calculateTotals = ({ subtotal, discountPercent = 0, deliveryFee = 0 }) => {
  const safeSubtotal = round(Math.max(0, subtotal));
  const discountAmount = round(safeSubtotal * (Math.min(100, Math.max(0, discountPercent)) / 100));
  const taxableAmount = Math.max(0, safeSubtotal - discountAmount);

  const tax = round(taxableAmount * TAX_RATE);
  const serviceFee = safeSubtotal > 0 ? SERVICE_FEE : 0;
  const delivery = safeSubtotal > 0 ? round(Math.max(0, deliveryFee)) : 0;

  return {
    subtotal: safeSubtotal,
    discountAmount,
    tax,
    serviceFee,
    deliveryFee: delivery,
    total: round(Math.max(0, safeSubtotal - discountAmount + tax + serviceFee + delivery)),
  };
};
