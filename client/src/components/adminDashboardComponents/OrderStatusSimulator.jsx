import React from 'react';

import Icon from '../common/Icon';
const STATUS_STEPS = [
  { status: 'PLACED', icon: 'receipt_long', label: 'Order Placed' },
  { status: 'ACCEPTED', icon: 'thumb_up', label: 'Order Accepted' },
  { status: 'PREPARING', icon: 'restaurant_menu', label: 'Preparing Food' },
  { status: 'READY_FOR_PICKUP', icon: 'done_all', label: 'Ready for Pickup' },
  { status: 'RIDER_ASSIGNED', icon: 'person', label: 'Rider Assigned' },
  { status: 'PICKED_UP', icon: 'shopping_bag', label: 'Picked Up' },
  { status: 'OUT_FOR_DELIVERY', icon: 'two_wheeler', label: 'Out for Delivery' },
  { status: 'DELIVERED', icon: 'home', label: 'Delivered' }
];

const OrderStatusSimulator = ({ activeOrder, handleUpdateStatus }) => {
  if (!activeOrder) {
    return (
      <div className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-full flex flex-col items-center justify-center text-center min-h-[500px]">
        <Icon name="inbox" className="text-4xl text-surface-variant mb-4" />
        <h3 className="font-h3 text-h3 font-bold text-on-surface mb-2">No Active Orders</h3>
        <p className="font-body text-body text-secondary">You currently have no pending or active orders to manage.</p>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.status === activeOrder.status);
  
  // If the status is not in the standard flow (e.g. Cancelled, Completed), handle gracefully
  const activeIndex = currentStatusIndex === -1 ? 4 : currentStatusIndex;

  return (
    <div className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden h-full min-h-[500px]">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="flex justify-between items-start mb-stack_lg relative z-10">
        <div>
          <h3 className="font-h3 text-h3 text-on-surface font-bold flex items-center gap-2">
            <Icon name="motion_photos_on" className="text-primary" />
            Live Order Simulator
          </h3>
          <p className="font-small text-small text-secondary mt-1">
            Actively managing Order {activeOrder.id}
          </p>
        </div>
        <div className="bg-primary-container text-on-primary-container font-label text-label px-3 py-1.5 rounded-full font-semibold shadow-sm">
          ${activeOrder.amount?.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-stack_lg bg-surface-container-low p-4 rounded-xl relative z-10">
        <img 
          src={activeOrder.avatar} 
          alt={activeOrder.customer} 
          className="w-12 h-12 rounded-full border-2 border-surface-container-lowest shadow-sm object-cover"
        />
        <div className="flex-1">
          <h4 className="font-button text-button font-bold text-on-surface">{activeOrder.customer}</h4>
          <p className="font-label text-label text-secondary">{activeOrder.itemsCount} Items</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10 py-4">
        <div className="relative">
          {/* The connector is drawn per step rather than as one absolutely
              positioned track. */}
          <div className="flex flex-col relative z-10">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isPending = idx > activeIndex;
              const isFirst = idx === 0;
              const isLast = idx === STATUS_STEPS.length - 1;

              return (
                <div
                  key={step.status}

                  className={`flex items-stretch gap-4 cursor-pointer group transition-opacity duration-300 ${isPending ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}
                  onClick={() => {
                    // Prevent moving backwards or clicking the same status
                    if (idx <= activeIndex) return;
                    handleUpdateStatus(activeOrder.originalId, step.status);
                  }}
                >
                  {/* Dot column: [connector above] [dot] [connector below]. */}
                  <div className="w-12 shrink-0 flex flex-col items-center self-stretch">
                    <span
                      aria-hidden="true"
                      className={`w-0.5 flex-1 rounded-full transition-colors duration-500 ${
                        isFirst ? 'bg-transparent' : idx <= activeIndex ? 'bg-primary' : 'bg-surface-variant'
                      }`}
                    />
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 shadow-sm ${
                        isCompleted ? 'bg-primary text-on-primary scale-90' :
                        isCurrent ? 'bg-primary text-on-primary scale-110 ring-4 ring-primary/20' :
                        'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                      }`}>
                        <Icon name={isCompleted ? 'check' : step.icon} className="text-[20px]" />
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`w-0.5 flex-1 rounded-full transition-colors duration-500 ${
                        isLast ? 'bg-transparent' : idx < activeIndex ? 'bg-primary' : 'bg-surface-variant'
                      }`}
                    />
                  </div>
                  {/* Border is always present (transparent when inactive) so the
                      card doesn't grow by 2px when it becomes current. */}
                  <div className={`flex-1 my-1 p-4 rounded-xl border transition-colors duration-300 self-center ${
                    isCurrent ? 'bg-primary/10 border-primary/20' :
                    'hover:bg-surface-container-high border-transparent'
                  }`}>
                    <h5 className={`font-button text-button font-bold ${
                      isCurrent ? 'text-primary' : 'text-on-surface'
                    }`}>
                      {step.label}
                    </h5>
                    <p className="font-label text-label text-secondary mt-0.5">
                      {isCurrent ? 'Current active state' : 
                       isCompleted ? 'Completed' : 'Click to advance to this state'}
                    </p>
                  </div>
                  
                  {isPending && idx === activeIndex + 1 && (
                    <button className="px-3 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -ml-4 whitespace-nowrap shadow-md">
                      Update
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusSimulator;
