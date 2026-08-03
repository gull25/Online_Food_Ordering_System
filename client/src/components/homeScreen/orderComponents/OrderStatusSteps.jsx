import React from 'react';

const OrderStatusSteps = ({ TIMELINE_STEPS, currentStep }) => {
  return (
    <div className="relative pt-stack_sm flex flex-col gap-y-8">
      {TIMELINE_STEPS.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        const isUpcoming = idx > currentStep;
        const isLast = idx === TIMELINE_STEPS.length - 1;

        return (
          <div key={idx} className="timeline-item relative flex gap-stack_md">
            {/* Vertical Connector Line */}
            {!isLast && (
              <div
                className={`absolute left-[11px] top-6 w-[2px] h-[calc(100%+32px)] z-0 transition-colors duration-500 ${
                  isCompleted ? 'bg-primary' : 'bg-surface-variant'
                }`}
              />
            )}

            {/* Indicator Circle */}
            <div
              className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm transition-all duration-500 ${
                isCompleted
                  ? 'bg-primary text-white'
                  : isActive
                  ? 'border-2 border-primary bg-surface-container-lowest text-primary'
                  : 'border-2 border-surface-variant bg-surface-container-lowest text-secondary'
              }`}
            >
              {isCompleted ? (
                <span className="material-symbols-outlined text-[14px] font-bold">
                  check
                </span>
              ) : isActive ? (
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              ) : null}
            </div>

            {/* Step description content */}
            <div className={`flex-grow transition-opacity duration-500 ${isUpcoming ? 'opacity-50' : 'opacity-100'}`}>
              <h3
                className={`font-button text-button ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface'
                }`}
              >
                {step.title}
              </h3>
              <p className="font-small text-small text-on-surface-variant mt-1">
                {step.description}
              </p>
            </div>

            <div className={`text-right transition-opacity duration-500 ${isUpcoming ? 'opacity-50' : 'opacity-100'}`}>
              <span
                className={`font-small text-small ${
                  isActive ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {isUpcoming ? 'Pending' : step.time}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatusSteps;
