import React from 'react';

const STATUS_STEPS = [
  { status: 'Pending', icon: 'receipt_long', label: 'Order Placed' },
  { status: 'Preparing', icon: 'restaurant_menu', label: 'Preparing Food' },
  { status: 'Ready', icon: 'done_all', label: 'Ready for Pickup' },
  { status: 'Out For Delivery', icon: 'two_wheeler', label: 'Out for Delivery' },
  { status: 'Delivered', icon: 'home', label: 'Delivered' }
];

const OrderStatusSimulator = ({ activeOrder, handleUpdateStatus }) => {
  if (!activeOrder) {
    return (
      <div className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-full flex flex-col items-center justify-center text-center min-h-[500px]">
        <span className="material-symbols-outlined text-4xl text-surface-variant mb-4">inbox</span>
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
            <span className="material-symbols-outlined text-primary">motion_photos_on</span>
            Live Order Simulator
          </h3>
          <p className="font-small text-small text-secondary mt-1">
            Actively managing Order {activeOrder.id}
          </p>
        </div>
        <div className="bg-primary-container text-on-primary font-label text-label px-3 py-1.5 rounded-full font-semibold shadow-sm">
          ${activeOrder.amount?.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-stack_lg bg-surface-container-low p-4 rounded-xl relative z-10">
        <img 
          src={activeOrder.avatar} 
          alt={activeOrder.customer} 
          className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
        />
        <div className="flex-1">
          <h4 className="font-button text-button font-bold text-on-surface">{activeOrder.customer}</h4>
          <p className="font-label text-label text-secondary">{activeOrder.itemsCount} Items</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10 py-4">
        <div className="relative">
          {/* Vertical connection line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-surface-variant z-0"></div>
          
          {/* Active progress line */}
          <div 
            className="absolute left-6 top-6 w-0.5 bg-primary z-0 transition-all duration-700 ease-in-out"
            style={{ 
              height: activeIndex > 0 ? `calc(${(activeIndex / (STATUS_STEPS.length - 1)) * 100}% - 12px)` : '0%',
              minHeight: activeIndex > 0 ? '0' : '0'
            }}
          ></div>

          <div className="flex flex-col gap-6 relative z-10">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isPending = idx > activeIndex;

              return (
                <div 
                  key={step.status} 
                  className={`flex items-center gap-4 cursor-pointer group transition-all duration-300 ${isPending ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}
                  onClick={() => {
                    // Prevent moving backwards or clicking the same status
                    if (idx <= activeIndex) return;
                    handleUpdateStatus(activeOrder.originalId, step.status);
                  }}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isCompleted ? 'bg-primary text-white scale-90' :
                      isCurrent ? 'bg-primary text-white scale-110 shadow-[0_0_15px_rgba(174,50,0,0.4)] ring-4 ring-primary/20' :
                      'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {isCompleted ? 'check' : step.icon}
                      </span>
                    </div>
                  </div>
                  <div className={`flex-1 p-3 rounded-xl transition-all duration-300 ${
                    isCurrent ? 'bg-primary/10 border border-primary/20 translate-x-2' : 
                    'hover:bg-surface-container-high border border-transparent'
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
                    <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -ml-4 whitespace-nowrap shadow-md">
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
