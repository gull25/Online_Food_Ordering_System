import React from 'react';

import Icon from '../../common/Icon';
const NewUserDiscounts = ({ copyPromoCode, copiedCode, offers }) => {
  const welcomeOffer = offers?.welcome;
  const deliveryOffer = offers?.delivery;

  // Only surface offers that actually exist. The previous version substituted
  // invented codes ('HELLO50', 'FREEDELIVERY') whenever the API returned fewer
  // than two offers, promising discounts the backend would then reject.
  if (!welcomeOffer?.code && !deliveryOffer?.code) return null;

  const welcomeTitle = welcomeOffer?.discountPercentage
    ? `${welcomeOffer.discountPercentage}% OFF`
    : welcomeOffer?.title;
  const welcomeImg =
    welcomeOffer?.image && welcomeOffer.image !== 'no-photo.jpg' ? welcomeOffer.image : null;

  return (
    <section className="mb-stack_lg">
      <div className="flex items-center justify-between mb-stack_md">
        <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-surface">Featured Discounts</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto lg:min-h-[400px]">
        {/* Left Bento: headline offer */}
        {welcomeOffer?.code && (
          <div
            className={`${
              deliveryOffer?.code ? 'md:col-span-8' : 'md:col-span-12'
            } bg-surface-container-low border border-outline-variant/30 rounded-24 p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm lift-hover`}
          >
            <div className="relative z-10 lg:w-[50%] flex flex-col justify-between h-full">
              <div>
                <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full font-label text-label mb-4 inline-block">
                  {welcomeOffer.type || 'FEATURED'}
                </span>
                <h3 className="text-[40px] font-extrabold leading-tight mb-2 text-primary text-balance">
                  {welcomeTitle}
                </h3>
                <p className="text-on-surface-variant font-body text-body max-w-sm">
                  {welcomeOffer.description}{' '}
                  <span className="font-bold text-on-primary-container select-all bg-surface/60 px-2 py-1 rounded whitespace-nowrap">
                    {welcomeOffer.code}
                  </span>
                </p>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => copyPromoCode(welcomeOffer.code)}
                  className="bg-primary text-on-primary px-6 py-3 rounded-xl font-button text-button hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-2 w-fit"
                >
                  <Icon name={copiedCode === welcomeOffer.code ? 'check' : 'content_copy'} className="text-[20px]" />
                  {copiedCode === welcomeOffer.code ? 'Copied!' : 'Claim Code'}
                </button>
              </div>
            </div>
            {welcomeImg && (
              <div className="absolute right-0 bottom-0 w-1/2 h-full hidden lg:block pointer-events-none">
                <img
                  className="w-full h-full object-contain object-right-bottom translate-y-8 group-hover:scale-105 transition-transform duration-500"
                  alt=""
                  aria-hidden="true"
                  src={welcomeImg}
                />
              </div>
            )}
          </div>
        )}

        {/* Right Bento: secondary offer */}
        {deliveryOffer?.code && (
          <div
            className={`${
              welcomeOffer?.code ? 'md:col-span-4' : 'md:col-span-12'
            } bg-primary text-on-primary rounded-24 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-sm lift-hover`}
          >
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <Icon name="local_offer" className="text-[64px] mb-4 opacity-90" />
            <h3 className="text-h3 font-h3 mb-2 font-bold text-balance">{deliveryOffer.title}</h3>
            <p className="opacity-80 text-small mb-6 line-clamp-3">{deliveryOffer.description}</p>
            <button
              onClick={() => copyPromoCode(deliveryOffer.code)}
              className="bg-surface-container-lowest text-primary px-6 py-3 rounded-xl font-button text-button hover:bg-surface-bright active:scale-95 transition-all shadow-md"
            >
              {copiedCode === deliveryOffer.code ? 'Copied!' : `Copy ${deliveryOffer.code}`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewUserDiscounts;
