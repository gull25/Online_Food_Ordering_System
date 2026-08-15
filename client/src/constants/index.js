export * from './appRoutes';
export * from './userRoles';
export * from './localStorageKeys';
export * from './orderStatus';


export const BASE_TIMELINE_STEPS = [
  {
    status: 'PLACED',
    title: 'Order Placed',
    description: "We've received your order.",
    icon: 'check',
  },
  {
    status: 'ACCEPTED',
    title: 'Order Accepted',
    description: 'The restaurant has accepted your order.',
    icon: 'thumb_up',
  },
  {
    status: 'PREPARING',
    title: 'Preparing Food',
    description: 'The kitchen is preparing your meal.',
    icon: 'restaurant_menu',
  },
  {
    status: 'READY_FOR_PICKUP',
    title: 'Ready for Pickup',
    description: 'Your order is ready to be picked up.',
    icon: 'done_all',
  },
  {
    status: 'RIDER_ASSIGNED',
    title: 'Rider Assigned',
    description: 'A rider has been assigned.',
    icon: 'person',
  },
  {
    status: 'PICKED_UP',
    title: 'Picked Up',
    description: 'The rider has picked up your order.',
    icon: 'shopping_bag',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    title: 'Out For Delivery',
    description: 'Your driver is on the way.',
    icon: 'two_wheeler',
  },
  {
    status: 'DELIVERED',
    title: 'Delivered',
    description: 'Enjoy your meal!',
    icon: 'home',
  },
];