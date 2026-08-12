/*
 * Order pricing, in one place.
 *
 * The same arithmetic previously lived in three: the order service, the checkout
 * screen, and (partially) the order summary component. They had already drifted —
 * the delivery fee was shown to the customer but omitted from the server-side
 * total, so the summary quoted one figure and the gateway charged another, and
 * the restaurant was never credited for delivery.
 *
 * Money is rounded to whole cents at every boundary. Accumulating unrounded
 * floats and rounding only at the end leaves the stored total differing from the
 * amount actually captured by a fraction of a cent, which reconciles as a
 * mismatch forever after.
 */

const TAX_RATE = 0.087;
const SERVICE_FEE = 2.5;
const PLATFORM_COMMISSION = 0.1;
const RIDER_SHARE = 0.1;

/** Rounds to cents without the `0.1 + 0.2` class of drift. */
const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.subtotal        Sum of line items, already priced from the DB.
 * @param {number} input.discountPercent 0-100.
 * @param {number} input.deliveryFee     From the restaurant record.
 */
const calculateTotals = ({ subtotal, discountPercent = 0, deliveryFee = 0 }) => {
    const safeSubtotal = round(Math.max(0, subtotal));
    const discountAmount = round(safeSubtotal * (Math.min(100, Math.max(0, discountPercent)) / 100));
    const taxableAmount = Math.max(0, safeSubtotal - discountAmount);

    const tax = round(taxableAmount * TAX_RATE);
    const serviceFee = safeSubtotal > 0 ? SERVICE_FEE : 0;
    const delivery = safeSubtotal > 0 ? round(Math.max(0, deliveryFee)) : 0;

    const totalAmount = round(Math.max(0, safeSubtotal - discountAmount + tax + serviceFee + delivery));

    return {
        subtotal: safeSubtotal,
        discountAmount,
        tax,
        serviceFee,
        deliveryFee: delivery,
        totalAmount,
    };
};

/** The platform's cut when funds are split to a connected Stripe account. */
const platformFee = ({ subtotal, serviceFee }) => round(subtotal * PLATFORM_COMMISSION + serviceFee);

/** What the courier earns for completing the delivery. */
const riderEarning = (totalAmount) => round(Math.max(0, totalAmount) * RIDER_SHARE);

module.exports = {
    round,
    calculateTotals,
    platformFee,
    riderEarning,
    TAX_RATE,
    SERVICE_FEE,
    PLATFORM_COMMISSION,
    RIDER_SHARE,
};
