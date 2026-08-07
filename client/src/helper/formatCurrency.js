/**
 * Currency formatting.
 *
 * The app was rendering a mix of `$` and `€` for the same values — menu cards
 * and the whole rider dashboard used `€` while the cart, checkout, receipts and
 * admin tables used `$`. Stripe is charged in USD (`currency: 'usd'`), so `$`
 * is the correct symbol and the euro signs were misreporting real amounts.
 *
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
