import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <main>
      <section className="relative min-h-[600px] w-full px-margin_mobile md:px-margin_desktop max-w-container_max mx-auto flex flex-col-reverse md:flex-row items-center pt-stack_lg md:pt-0 overflow-hidden">
        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center z-10 py-stack_lg md:py-0">
          <div className="inline-flex items-center gap-2 bg-primary-fixed text-on-primary-fixed-variant px-4 py-2 rounded-full font-label text-label w-fit mb-stack_md">
            <span className="material-symbols-outlined text-[16px] fill">local_fire_department</span>
            #1 Delivery Service in City
          </div>
          <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-on-surface mb-stack_md md:pr-12">
            Delicious food delivered to your <span className="text-primary-container">doorstep</span>
          </h1>
          <p className="font-body text-body text-secondary mb-stack_lg md:pr-12 max-w-[500px]">
            Craving something special? Explore top-rated restaurants near you and enjoy lightning-fast delivery with live tracking. Your next great meal is just a few clicks away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/restaurant/bella-cucina" className="font-button text-button bg-primary-container text-on-primary h-12 px-8 rounded-xl hover:opacity-90 transition-opacity shadow-[0px_10px_30px_rgba(255,90,31,0.2)] flex items-center justify-center gap-2">
              Order Now
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
            <Link to="/restaurant/bella-cucina" className="font-button text-button bg-surface-container-lowest text-on-surface border border-surface-variant h-12 px-8 rounded-xl hover:bg-surface-variant transition-colors flex items-center justify-center">
              Explore Restaurants
            </Link>
          </div>
          {/* Trust Indicators */}
          <div className="flex items-center gap-6 mt-stack_lg pt-stack_md border-t border-surface-variant w-fit">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover z-30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDfH41yZq8qZ6PpE7LM8RmC07Mjz_wgZ5JRZlYclCkqdWsyQUbLr_iVjPyMGhdx7g1z2GjSDI3cmfa5CBoeQ2da48yk05FYzi7eHgkA7f2YlyjMdIXg2-1Ld7o67GocUhy8H4vw66Zh3mP9VEpXu-qtLtzS_xtDhcvoGcVEAzvx8DSAyQQ8j-ECXrQQfWuC2Ju_QPWsr7DyEZ3GtEOlhn91qzEJkzO_xPWgItnH3wDgvsMEcqpI6S3Lw" alt="Customer 1" />
              <img className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover z-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArCVIz5D-pNblmQ3mn4ppPlOPOt-9xDXa7lv0rBDCIEf6uDUIZ93jkJvQXQOZ46c84L2bSMFy9IaVSR-uJyj8FzM7WB2IQzJma3Bs5pcfKiDqaWnEa9nEj3D5OfjJOZB0rLBY1tmmKef_lkCVfh4MpUyNVSOK9LbNfdAAZZiG_S6AmYquq0DhDg4hGFU89oUc_mVmjQZvSd6msD9uY06Qg9Wpz589P8OlAi9YmSdCMnPVX4XSwujgRLw" alt="Customer 2" />
              <img className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover z-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArhBOrpqBVMelle2NxdC0SjjwaLRMyjqcpjytYMvmcKb7qr92xQte8t0uPS1jiFtSiBgikIZH4CBaHgh-Kf1qs3ZeHRimftrrW5A9BBh_L6cX4HKbG-2la717OGKX_TFYdD6wyKmT9EC_xwRYxrPrYLN0htWQ74YPkgFdoFAOZNAhU6E0R5AiAkc-MVymAm4XSXq8OHW5xgnbWnT0nNakNQxPt5zaq8luAXIzDgdNgSES_gEVR20An3Q" alt="Customer 3" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-primary-container">
                <span className="material-symbols-outlined text-[16px] fill">star</span>
                <span className="material-symbols-outlined text-[16px] fill">star</span>
                <span className="material-symbols-outlined text-[16px] fill">star</span>
                <span className="material-symbols-outlined text-[16px] fill">star</span>
                <span className="material-symbols-outlined text-[16px] fill">star</span>
              </div>
              <span className="font-small text-small text-secondary">5000+ Happy Customers</span>
            </div>
          </div>
        </div>
        {/* Right Image Area */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-[600px] flex items-center justify-center md:justify-end">
          {/* Background Blob/Shape */}
          <div className="absolute w-[80%] h-[80%] bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 z-0 top-1/2 right-0 -translate-y-1/2"></div>
          {/* Main Image Container */}
          <div className="relative z-10 w-full max-w-[500px] aspect-square rounded-full flex items-center justify-center p-4">
            <img className="w-full h-full object-cover rounded-full shadow-[0px_20px_40px_rgba(0,0,0,0.1)] animate-float" src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80" alt="Delicious Food" />
            {/* Floating Brand Logo */}
            <div className="absolute -top-4 -right-4 md:top-10 md:-right-8 w-24 h-24 bg-surface-container-lowest rounded-full shadow-[0px_10px_30px_rgba(0,0,0,0.08)] flex items-center justify-center p-2 z-20 animate-float-delayed border border-surface-variant">
              <img alt="Foodora Logo" className="w-full h-full object-contain rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIRotv3KusC0-eEkoi6nMGJV0kcRSaKh_6k9mjmj6g0D0bNJE80wTGZR3BBGvUBRyPA92CjyGkZ3SRxeoTzlUGvw20duWzHOHpwDcgREfdwI1jdVdcQY4MKP3zX8gQWt3Ev_ipuRplndgbwJAhjRKNvCjsPnznwqUfqCBu2EioCp0l5kjo0ScZlxqrvQ3yW9NxCtdIYVyZMo1erTUc5clNuvgflwFN1dCHun1m-X1Q6QllrFw8x6rXWA" />
            </div>
            {/* Floating Card: 30 Min Delivery */}
            <div className="absolute bottom-10 -left-4 md:-left-12 bg-surface-container-lowest p-4 rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.08)] border border-surface-variant flex items-center gap-3 z-20 animate-float">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined fill">schedule</span>
              </div>
              <div className="flex flex-col">
                <span className="font-button text-button text-on-surface">30 min</span>
                <span className="font-small text-small text-secondary">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HeroSection;
