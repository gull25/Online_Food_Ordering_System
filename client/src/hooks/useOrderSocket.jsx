import React, { useEffect, useState } from 'react';
import { socket, connectSocket, joinOrderRoom, leaveOrderRoom } from '../helper/socket';
import { orderStatusUpdated } from '../redux/orderSlice';
import { toast } from 'react-hot-toast';
import Icon from '../components/common/Icon';

export const useOrderSocket = (orderId, user, order, dispatch) => {
  const [riderGpsPosition, setRiderGpsPosition] = useState(null);
  const [assignedRider, setAssignedRider] = useState(null);
  const [driverNotification, setDriverNotification] = useState('');
  const [isLocationUpdatesActive, setIsLocationUpdatesActive] = useState(true);
  const [reviewItem, setReviewItem] = useState(null);

  // Set initial assigned rider if order is loaded with one
  useEffect(() => {
    if (order?.rider) {
      setAssignedRider({
        name: order.rider.name,
        phone: order.rider.phone,
        vehicle: order.rider.vehicleDetails,
        location: order.rider.currentLocation // might be null
      });
      if (order.rider.currentLocation?.coordinates) {
        setRiderGpsPosition({
          lat: order.rider.currentLocation.coordinates[1],
          lng: order.rider.currentLocation.coordinates[0]
        });
      }
    }
  }, [order?.rider]);

  // WebSocket Integration for Real-Time Updates
  useEffect(() => {
    if (!user?._id || !orderId) return;

    // 1. Connect and register this user
    connectSocket(user._id);

    // 2. Join the specific order room so we receive events for this order only
    joinOrderRoom(orderId);

    // 3. Listen for status updates (restaurant admin changed status)
    socket.on('orderStatusUpdate', (updatedOrder) => {
      if (updatedOrder._id === orderId || updatedOrder._id?.toString() === orderId) {
        dispatch(orderStatusUpdated(updatedOrder));
        if (updatedOrder.status === 'DELIVERED') {
          toast((t) => (
            <div className="flex flex-col gap-3 p-1">
              <span className="font-bold text-on-surface flex items-center gap-2">
                <Icon name="check_circle" className="text-primary text-[20px]" />
                Order Delivered!
              </span>
              <p className="font-body text-[13px] text-secondary">
                Your food has arrived. How was it?
              </p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  if (updatedOrder.items && updatedOrder.items.length > 0) {
                    setReviewItem(updatedOrder.items[0]);
                  }
                }}
                className="mt-1 w-full bg-primary text-on-primary py-2 px-4 rounded-xl font-button text-sm shadow-md hover:bg-primary/90 transition-colors"
              >
                Rate & Review Now
              </button>
            </div>
          ), { duration: 10000 });
        }
      }
    });

    socket.on('order:accepted', () => toast.success('Restaurant accepted your order!'));
    socket.on('order:rejected', (data) => toast.error(`Order rejected: ${data.reason}`));
    socket.on('order:preparing', () => toast.success('Your food is being prepared!'));
    socket.on('order:ready', () => toast.success('Your order is ready for pickup!'));
    socket.on('order:picked_up', () => toast.success('Rider picked up your order!'));
    socket.on('order:out_for_delivery', () => toast.success('Rider is on the way!'));
    socket.on('order:delivered', () => toast.success('Your order has been delivered!'));
    socket.on('order:cancelled', () => toast.error('Your order was cancelled.'));

    // 4. Listen for rider assignment notification
    socket.on('order:rider_assigned', (data) => {
      if (data.orderId === orderId || data.orderId?.toString() === orderId) {
        setAssignedRider({ name: data.riderName, phone: data.riderPhone, vehicle: data.vehicleDetails });
        toast.success(`🏄 ${data.riderName} has been assigned to your order!`, { duration: 5000 });
      }
    });

    // 5. Listen for rider GPS location
    socket.on('rider:location', (data) => {
      if (data.orderId === orderId || data.orderId?.toString() === orderId) {
        setRiderGpsPosition({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      socket.off('orderStatusUpdate');
      socket.off('order:accepted');
      socket.off('order:rejected');
      socket.off('order:preparing');
      socket.off('order:ready');
      socket.off('order:picked_up');
      socket.off('order:out_for_delivery');
      socket.off('order:delivered');
      socket.off('order:cancelled');
      socket.off('order:rider_assigned');
      socket.off('rider:location');
      leaveOrderRoom(orderId);
    };
  }, [user, orderId, dispatch]);

  const handleDriverAction = (action) => {
    const riderName = assignedRider?.name || 'your rider';
    setDriverNotification(`${action} ${riderName}...`);
    setTimeout(() => setDriverNotification(''), 3000);
  };

  return {
    riderGpsPosition,
    assignedRider,
    driverNotification,
    handleDriverAction,
    isLocationUpdatesActive,
    setIsLocationUpdatesActive,
    reviewItem,
    setReviewItem
  };
};
