import React from 'react';
import { Link } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import HomeFooter from '../../components/homeScreen/homeScreenComponents/HomeFooter';

const PaymentFailedScreen = () => {
  return (
    <div className="bg-background text-on-background min-h-screen relative flex flex-col">
      <TopNavBar />

      <main className="pt-24 pb-16 px-margin_mobile md:px-margin_desktop max-w-container_max mx-auto flex-grow w-full flex items-center justify-center">
        <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 shadow-sm border border-outline-variant text-center max-w-md w-full">
          <div className="w-20 h-20 bg-error-container text-on-error-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl">error</span>
          </div>
          
          <h1 className="text-h2 font-h2 font-bold mb-4 text-on-surface">Payment Failed</h1>
          <p className="text-body font-body text-secondary mb-8">
            We couldn't process your payment. Your order has not been placed. Please try again with a different payment method.
          </p>
          
          <div className="flex flex-col gap-4">
            <Link 
              to="/checkout"
              className="h-14 bg-primary text-on-primary rounded-xl font-button text-button flex items-center justify-center hover:opacity-90 transition-opacity w-full"
            >
              Try Again
            </Link>
            <Link 
              to="/"
              className="h-14 border border-outline-variant text-on-surface rounded-xl font-button text-button flex items-center justify-center hover:bg-surface-container-low transition-colors w-full"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
};

export default PaymentFailedScreen;
