import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingCartSummary = ({ totalCartCount, cartDescription, totalCartPrice }) => {
  const navigate = useNavigate();

  return (
    <>
      {totalCartCount > 0 && (
        <div className="fixed bottom-0 md:bottom-8 left-0 w-full px-margin_mobile md:px-0 md:flex md:justify-center z-50 pointer-events-none mb-4 md:mb-0">
          <div
            onClick={() => navigate('/checkout')}
            className="bg-inverse-surface dark:bg-surface-container-lowest text-on-primary dark:text-primary rounded-16 shadow-[0px_10px_30px_rgba(0,0,0,0.08)] p-4 flex items-center justify-between pointer-events-auto w-full md:w-[400px] hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary-container text-white w-10 h-10 rounded-full flex items-center justify-center font-button text-button animate-bounce">
                {totalCartCount}
              </div>
              <div className="max-w-[200px]">
                <div className="font-button text-button">View Cart</div>
                <div className="font-small text-small text-surface-variant/80 truncate">
                  {cartDescription}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-h3 text-h3 font-bold">€{totalCartPrice.toFixed(2)}</span>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCartSummary;
