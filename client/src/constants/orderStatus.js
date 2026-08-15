export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PLACED: 'PLACED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  RIDER_ASSIGNED: 'RIDER_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  REFUNDED: 'REFUNDED',
};

/** Human-readable labels — never show raw enum values in the UI. */
export const ORDER_STATUS_LABELS = {
  PENDING_PAYMENT: 'Awaiting Payment',
  PAYMENT_FAILED: 'Payment Failed',
  PLACED: 'Placed',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for Pickup',
  RIDER_ASSIGNED: 'Rider Assigned',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
  REFUNDED: 'Refunded',
};

export const getOrderStatusLabel = (status) =>
  ORDER_STATUS_LABELS[status] || (status ? String(status).replace(/_/g, ' ') : 'Unknown');

/** Statuses where the order is finished. */
export const TERMINAL_ORDER_STATUSES = [
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.REJECTED,
  ORDER_STATUS.REFUNDED,
  ORDER_STATUS.PAYMENT_FAILED,
];

/** Statuses that are live in the kitchen/delivery pipeline. */
export const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.PLACED,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.RIDER_ASSIGNED,
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
];

export const isActiveOrder = (status) => ACTIVE_ORDER_STATUSES.includes(status);
export const isTerminalOrder = (status) => TERMINAL_ORDER_STATUSES.includes(status);


export const getOrderStatusBadgeClass = (status) => {
  switch (status) {
    case ORDER_STATUS.DELIVERED:
      return 'bg-tertiary-container/20 text-tertiary border border-tertiary/30';
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.REJECTED:
    case ORDER_STATUS.PAYMENT_FAILED:
      return 'bg-error/10 text-error border border-error/25';
    case ORDER_STATUS.REFUNDED:
      return 'bg-secondary/10 text-secondary border border-secondary/25';
    case ORDER_STATUS.PENDING_PAYMENT:
      return 'bg-surface-variant/50 text-on-surface-variant border border-outline-variant';
    case ORDER_STATUS.PREPARING:
    case ORDER_STATUS.READY_FOR_PICKUP:
      return 'bg-primary-container/15 text-primary border border-primary/25';
    case ORDER_STATUS.RIDER_ASSIGNED:
    case ORDER_STATUS.PICKED_UP:
    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return 'bg-tertiary/10 text-tertiary border border-tertiary/25';
    case ORDER_STATUS.PLACED:
    case ORDER_STATUS.ACCEPTED:
    default:
      return 'bg-surface-container-high text-on-surface-variant border border-outline-variant';
  }
};

/** Text-only variant for dense table cells. */
export const getOrderStatusTextClass = (status) => {
  switch (status) {
    case ORDER_STATUS.DELIVERED:
      return 'text-tertiary';
    case ORDER_STATUS.CANCELLED:
    case ORDER_STATUS.REJECTED:
    case ORDER_STATUS.PAYMENT_FAILED:
      return 'text-error';
    case ORDER_STATUS.PREPARING:
    case ORDER_STATUS.READY_FOR_PICKUP:
      return 'text-primary';
    case ORDER_STATUS.RIDER_ASSIGNED:
    case ORDER_STATUS.PICKED_UP:
    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return 'text-tertiary';
    default:
      return 'text-on-surface-variant';
  }
};

/** Ordered pipeline used to drive the customer-facing tracking timeline. */
export const ORDER_TIMELINE_SEQUENCE = [
  ORDER_STATUS.PLACED,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY_FOR_PICKUP,
  ORDER_STATUS.RIDER_ASSIGNED,
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
];
