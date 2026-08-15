import { ORDER_STATUS } from '../constants/orderStatus';

export const ORDER_TIMELINE_STEPS = [
  {
    status: ORDER_STATUS.PLACED,
    title: 'Order Placed',
    description: "We've received your order.",
    icon: 'check',
  },
  {
    status: ORDER_STATUS.ACCEPTED,
    title: 'Order Accepted',
    description: 'The restaurant has accepted your order.',
    icon: 'thumb_up',
  },
  {
    status: ORDER_STATUS.PREPARING,
    title: 'Preparing Food',
    description: 'The kitchen is preparing your meal.',
    icon: 'restaurant_menu',
  },
  {
    status: ORDER_STATUS.READY_FOR_PICKUP,
    title: 'Ready for Pickup',
    description: 'Your order is ready to be picked up.',
    icon: 'done_all',
  },
  {
    status: ORDER_STATUS.RIDER_ASSIGNED,
    title: 'Rider Assigned',
    description: 'A rider has been assigned.',
    icon: 'person',
  },
  {
    status: ORDER_STATUS.PICKED_UP,
    title: 'Picked Up',
    description: 'The rider has picked up your order.',
    icon: 'shopping_bag',
  },
  {
    status: ORDER_STATUS.OUT_FOR_DELIVERY,
    title: 'Out For Delivery',
    description: 'Your driver is on the way.',
    icon: 'two_wheeler',
  },
  {
    status: ORDER_STATUS.DELIVERED,
    title: 'Delivered',
    description: 'Enjoy your meal!',
    icon: 'home',
  },
];
