const ApiError = require('./ApiError');

const VALID_TRANSITIONS = {
  PENDING_PAYMENT: ['PLACED', 'PAYMENT_FAILED', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
  PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['RIDER_ASSIGNED', 'CANCELLED'],
  RIDER_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REJECTED: [],
  REFUNDED: [],
};

const ROLE_PERMISSIONS = {
  restaurant_admin: ['ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'CANCELLED'],
  rider: ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'],
  customer: ['CANCELLED'],
  system: ['PLACED', 'PENDING_PAYMENT', 'PAYMENT_FAILED', 'REFUNDED'],
};

const canTransition = (currentStatus, newStatus) => {
  const allowedNext = VALID_TRANSITIONS[currentStatus];
  return allowedNext && allowedNext.includes(newStatus);
};

const canRoleTransition = (role, newStatus) => {
  // admin or super_admin can do anything for simplicity in this flow, but ideally constrained
  if (role === 'admin' || role === 'super_admin') return true;
  const allowedStatuses = ROLE_PERMISSIONS[role];
  return allowedStatuses && allowedStatuses.includes(newStatus);
};

const enforceTransition = (currentStatus, newStatus, role) => {
  if (!canTransition(currentStatus, newStatus)) {
    throw new ApiError(400, `Cannot transition order status from ${currentStatus} to ${newStatus}`);
  }
  if (!canRoleTransition(role, newStatus)) {
    throw new ApiError(403, `User role '${role}' is not allowed to set order status to ${newStatus}`);
  }
};

module.exports = {
  VALID_TRANSITIONS,
  ROLE_PERMISSIONS,
  canTransition,
  canRoleTransition,
  enforceTransition
};
