import React from 'react';
import Icon from '../../common/Icon';
import { HOW_TO_SAVE_STEPS } from '../../../data/offersData';
import { Reveal } from '../../common/Reveal';

const HowToSaveSection = () => {
  return (
    <Reveal as="section" className="bg-surface-container-high rounded-32 p-8 md:p-12 mb-stack_lg overflow-hidden relative shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack_lg items-center">
        <div>
          <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-surface mb-6">How to save more</h2>
          <div className="space-y-6">
            {HOW_TO_SAVE_STEPS.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 shadow-md">
                  {step.number}
                </div>
                <div>
                  <h4 className="font-h3 text-[18px] mb-1 font-semibold text-on-surface">{step.title}</h4>
                  <p className="text-on-surface/80 text-body">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative hidden lg:block h-100">
          <img
            className="w-full h-full object-contain rounded-2xl"
            alt="Smartphone showing a discount applied at checkout"
            loading="lazy"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0L7M4U-X5RDhfOZLk1cMV3SwuSUvpG_Z1PmStcizeL2CMV43-TUUrKSz6utpUSNK63m210YYXtP2rGoETQzItHpkQ69PhXnfXqw80VEXyHEoD6d3wrFmKpx2HUYo_gtkPDISe8g6C72Ex9zaV5G8jp7TGEe934wo8Hih6lhmARpZ-rMIokqAF2FojAaLiQ5ymC-j7Qeg2Uzjk1Y9sPmDxgsNbZvfktyZk50DQF_wJ0THMK3V6VbFalA"
          />
          {/* Floats gently rather than bouncing on a loop — a permanently
              animating badge pulls the eye away from the actual content. */}
          <div
            className="absolute -bottom-4 -right-4 bg-surface-container-lowest p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-surface-variant animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <Icon name="check_circle" className="text-tertiary text-[32px]" />
            <div>
              <p className="font-bold text-on-surface">Savings applied at checkout</p>
              <p className="text-small text-on-surface-variant">Promo codes are validated live</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
};

export default HowToSaveSection;
