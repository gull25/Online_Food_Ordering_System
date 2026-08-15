import React from 'react';
import Icon from '../../common/Icon';
import { ORDER_STATUS } from '../../../constants/orderStatus';

const OrderSummary = ({ order, setReviewItem }) => {
  return (
    <div className="bg-surface-container-lowest p-gutter rounded-xl border border-surface-variant shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="font-button text-button text-on-surface mb-stack_md font-bold">
        Order Summary
      </h3>
      <div className="flex flex-col gap-stack_sm">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-surface-variant last:border-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-stack_sm">
                <span className="font-body text-body text-on-surface-variant">
                  {item.quantity}x
                </span>
                <span className="font-body text-body text-on-surface">{item.name}</span>
              </div>
              {order.status === ORDER_STATUS.DELIVERED && (
                <div className="mt-2">
                  {item.isReviewed ? (
                    <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1">
                      <Icon name="check_circle" className="text-[14px]" /> Reviewed
                    </span>
                  ) : (
                    <button
                      onClick={() => setReviewItem(item)}
                      className="text-xs px-3 py-1 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20 transition-colors"
                    >
                      Rate & Review
                    </button>
                  )}
                </div>
              )}
            </div>
            <span className="font-body text-body text-on-surface">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-surface-variant my-stack_md"></div>

      <div className="flex justify-between items-center">
        <span className="font-button text-button text-on-surface font-bold">Total</span>
        <span className="font-button text-button text-on-surface font-bold">
          ${order.totalAmount.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;
