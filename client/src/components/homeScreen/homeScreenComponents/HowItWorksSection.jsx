import React from 'react';
import Icon from '../../common/Icon';
import { HOW_IT_WORKS_STEPS } from '../../../data/homeData';

const HowItWorksSection = () => {
  return (
    <section className="py-stack_lg bg-surface-container-low">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="text-center mb-stack_lg">
              <h2 className="font-h2 text-h2 text-on-background">Order in 3 easy steps</h2>
              <p className="text-body font-body text-secondary">Getting your favorite food has never been simpler</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-center">
              {HOW_IT_WORKS_STEPS.map((step, index) => {
                const bgColors = ['bg-primary-fixed', 'bg-tertiary-fixed', 'bg-secondary-fixed'];
                const textColors = ['text-primary', 'text-tertiary', 'text-secondary'];
                return (
                  <div key={index} className="flex flex-col items-center p-stack_md">
                    <div className={`w-20 h-20 rounded-full ${bgColors[index]} flex items-center justify-center mb-stack_md ${textColors[index]}`}>
                      <Icon name={step.icon} className="text-[40px]" />
                    </div>
                    <h3 className="font-h3 text-h3 mb-2">{step.title}</h3>
                    <p className="text-body text-secondary">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
  );
};

export default HowItWorksSection;
