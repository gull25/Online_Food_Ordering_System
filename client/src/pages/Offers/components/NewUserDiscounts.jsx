import React from 'react';

const NewUserDiscounts = ({ copyPromoCode, copiedCode }) => {
  return (
    <section className="mb-stack_lg">
      <div className="flex items-center justify-between mb-stack_md">
        <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-surface">New User Discounts</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto lg:h-[400px]">
        {/* Left Bento: 50% Off Welcome Pack */}
        <div className="md:col-span-8 bg-surface-container-low border border-outline-variant/30 rounded-[24px] p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm">
          <div className="relative z-10">
            <span className="bg-tertiary-container text-white px-3 py-1.5 rounded-full font-label text-label mb-4 inline-block">
              WELCOME PACK
            </span>
            <h3 className="text-[40px] font-extrabold leading-tight mb-2 text-primary">50% OFF</h3>
            <p className="text-on-surface-variant font-body text-body max-w-xs">
              On your first 3 orders. Max discount $15 per order. Use code:{' '}
              <span className="font-bold text-on-surface select-all bg-white/60 px-2 py-1 rounded">
                HELLO50
              </span>
            </p>
          </div>
          <div className="relative z-10 flex gap-4 mt-6">
            <button
              onClick={() => copyPromoCode('HELLO50')}
              className="bg-primary text-white px-6 py-3 rounded-xl font-button text-button hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined">content_copy</span>
              {copiedCode === 'HELLO50' ? 'Copied!' : 'Claim Code'}
            </button>
          </div>
          <div className="absolute right-0 bottom-0 w-1/2 h-full hidden lg:block">
            <img
              className="w-full h-full object-contain object-right-bottom translate-y-8 group-hover:scale-105 transition-transform duration-500"
              alt="Healthy Poke bowl mockup"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhjBa9WNpwPTWCPb115FVDOrmq5keeqSge7gVzZqe_Z1yDHMgInyBleGat0YJw9o_mH8tZiFRSjl__7MizThqNKIJrjOC2dky6e4UHamh3lkv4X2raM1Y_5cj8GJWHq6jGCc2nPpb5ewcUxNBUErRRK8lb4Gz-TU2R4cxJf9IcnFH6AEnh3zjPykA6xJPd0Vs7C0vlVRGNZWMv_OyeqkITlR6EUtelNlKnTCWrw-LQCrB1XML-Wjc_2A"
            />
          </div>
        </div>
        {/* Right Bento: Free Delivery Trial */}
        <div className="md:col-span-4 bg-primary text-white rounded-[24px] p-8 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-sm">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <span className="material-symbols-outlined text-[64px] mb-4 text-white/90">
            delivery_dining
          </span>
          <h3 className="text-h3 font-h3 mb-2 font-bold">FREE Delivery</h3>
          <p className="text-white/80 text-small mb-6">
            No minimum order for your first month. Stay hungry, we've got the gas.
          </p>
          <button
            onClick={() => copyPromoCode('FREEDELIVERY')}
            className="bg-white text-primary px-6 py-3 rounded-xl font-button text-button hover:bg-surface-bright active:scale-95 transition-all shadow-md"
          >
            {copiedCode === 'FREEDELIVERY' ? 'Copied Coupon!' : 'Start Free Trial'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewUserDiscounts;
