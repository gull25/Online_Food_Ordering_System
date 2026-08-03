import React from 'react';

const HowItWorksSection = () => {
  return (
    <section className="py-stack_lg bg-surface-container-low animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="text-center mb-stack_lg">
              <h2 className="font-h2 text-h2 text-on-background">Order in 3 easy steps</h2>
              <p className="text-body font-body text-secondary">Getting your favorite food has never been simpler</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-center">
              <div className="flex flex-col items-center p-stack_md">
                <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center mb-stack_md text-primary">
                  <span className="material-symbols-outlined text-[40px]">restaurant_menu</span>
                </div>
                <h3 className="font-h3 text-h3 mb-2">Select Your Meal</h3>
                <p className="text-body text-secondary">Browse through thousands of menus to find what you crave.</p>
              </div>
              <div className="flex flex-col items-center p-stack_md">
                <div className="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center mb-stack_md text-tertiary">
                  <span className="material-symbols-outlined text-[40px]">shopping_bag</span>
                </div>
                <h3 className="font-h3 text-h3 mb-2">Easy Checkout</h3>
                <p className="text-body text-secondary">Pay securely with multiple options and track your order live.</p>
              </div>
              <div className="flex flex-col items-center p-stack_md">
                <div className="w-20 h-20 rounded-full bg-secondary-fixed flex items-center justify-center mb-stack_md text-secondary">
                  <span className="material-symbols-outlined text-[40px]">delivery_dining</span>
                </div>
                <h3 className="font-h3 text-h3 mb-2">Enjoy Your Food</h3>
                <p className="text-body text-secondary">Sit back and relax while we bring the restaurant experience to you.</p>
              </div>
            </div>
          </div>
        </section>
  );
};

export default HowItWorksSection;
