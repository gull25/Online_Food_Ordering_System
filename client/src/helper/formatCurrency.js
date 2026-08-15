/**
 * Currency formatting.
 * Routing every price through one helper keeps that consistent.
 */
export const CURRENCY_CODE = 'USD';
export const CURRENCY_SYMBOL = '$';

/** `formatCurrency(12.5)` → `"$12.50"`. Handles null/NaN as $0.00. */
export const formatCurrency = (value, { withSymbol = true } = {}) => {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  const formatted = safe.toFixed(2);
  return withSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted;
};

export default formatCurrency;
