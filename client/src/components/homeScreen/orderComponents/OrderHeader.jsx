import React from 'react';
import Icon from '../../common/Icon';
import OrderStatusSteps from './OrderStatusSteps';
import { cancelOrderThunk } from '../../../redux/orderSlice';
import {
  ORDER_STATUS,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
} from '../../../constants/orderStatus';

const OrderHeader = ({ order, mutating, dispatch, timelineSteps, currentStep }) => {
  return (
    <div className="bg-surface-container-lowest p-gutter rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-start mb-stack_md">
        <div>
          <h1 className="font-h2-mobile md:font-h2 text-h2-mobile md:text-h2 text-on-surface mb-stack_sm">
            Order #{order._id.substring(order._id.length - 6).toUpperCase()}
          </h1>
          <p className="font-body text-body text-on-surface-variant">
            Placed At: <strong>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {(order.status === ORDER_STATUS.PLACED || order.status === ORDER_STATUS.ACCEPTED) && (
            <button
              onClick={() => {
                // Confirm before cancelling order
                if (window.confirm('Cancel this order? This cannot be undone.')) {
                  dispatch(cancelOrderThunk(order._id));
                }
              }}
              disabled={mutating}
              className="text-error border border-error px-3 py-1.5 rounded-full font-label text-label hover:bg-error/10 transition-colors disabled:opacity-50"
            >
              {mutating ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          <div className={`font-label text-label px-3 py-1.5 rounded-full inline-block font-semibold ${getOrderStatusBadgeClass(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </div>
        </div>
      </div>

      {order.status === ORDER_STATUS.REJECTED && (
        <div className="bg-error/10 text-error p-3 rounded-lg mb-stack_md border border-error/20 flex gap-2 items-center">
          <Icon name="error" />
          <span><strong>Order Rejected:</strong> {order.rejectionReason || 'No reason provided.'}</span>
        </div>
      )}
      {order.status === ORDER_STATUS.CANCELLED && (
        <div className="bg-error/10 text-error p-3 rounded-lg mb-stack_md border border-error/20 flex gap-2 items-center">
          <Icon name="cancel" />
          <span><strong>Order Cancelled:</strong> Cancelled by {order.cancelledBy || 'user'}.</span>
        </div>
      )}
      {order.estimatedDeliveryTime && (
        <div className="bg-primary/10 text-primary p-3 rounded-lg mb-stack_md border border-primary/20 flex gap-2 items-center">
          <Icon name="schedule" />
          <span><strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}

      <div className="h-px w-full bg-surface-variant my-stack_md"></div>

      {/* Vertical Timeline */}
      <OrderStatusSteps TIMELINE_STEPS={timelineSteps} currentStep={currentStep} />
    </div>
  );
};

export default OrderHeader;
