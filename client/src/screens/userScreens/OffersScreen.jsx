import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Icon from '../../components/common/Icon';
import { Link } from 'react-router-dom';

import NewsletterSignup from '../../components/homeScreen/offersComponents/NewsletterSignup';
import FlashSaleBanner from '../../components/homeScreen/offersComponents/FlashSaleBanner';
import OffersFilter from '../../components/homeScreen/offersComponents/OffersFilter';
import NewUserDiscounts from '../../components/homeScreen/offersComponents/NewUserDiscounts';
import HowToSaveSection from '../../components/homeScreen/offersComponents/HowToSaveSection';
import OffersEmptyState from '../../components/homeScreen/offersComponents/OffersEmptyState';
import api from '../../api/axios';
import { OfferGridSkeleton, Skeleton } from '../../components/common/Skeleton';
import { Reveal } from '../../components/common/Reveal';
import FastBitesLogo from '../../assets/images/FastBitesLogo.png';
import { getOfferImage } from '../../helper/offerUtils';
import { useOffersData } from '../../hooks/useOffersData';

const OffersPage = () => {
  const {
    loading,
    restaurant,
    activeRestaurantId,
    searchQuery,
    setSearchQuery,
    flashOffer,
    formattedTime,
    newOffers,
    filteredOffers
  } = useOffersData();

  const [copiedCode, setCopiedCode] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    try {
      await api.post('/subscribers', {
        email: newsletterEmail.trim(),
        ...(activeRestaurantId && { restaurantId: activeRestaurantId })
      });
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
      toast.success('Successfully subscribed to the newsletter!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe to newsletter');
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen relative flex flex-col">
      <main id="main-content" tabIndex={-1} className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg grow w-full">
        {/* Restaurant context header — shown only in restaurant-specific mode */}
        {loading && activeRestaurantId && (
          <div className="flex items-center gap-4 mb-stack_md">
            <Skeleton rounded="rounded-full" className="h-12 w-12" />
            <div className="flex flex-col gap-2">
              <Skeleton rounded="rounded" className="h-3 w-20" />
              <Skeleton rounded="rounded" className="h-6 w-40" />
            </div>
          </div>
        )}
        {!loading && restaurant && (
          <div className="flex items-center gap-4 mb-stack_md">
            <Link to={`/restaurant/${restaurant._id}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant/30 bg-surface-container flex-shrink-0 group-hover:border-primary transition-colors">
                <img
                  src={
                    (restaurant.images?.logo && restaurant.images.logo !== 'no-photo.jpg')
                      ? restaurant.images.logo
                      : (restaurant.image && restaurant.image !== 'no-photo.jpg')
                        ? restaurant.image
                        : FastBitesLogo
                  }
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FastBitesLogo;
                  }}
                />
              </div>
              <div>
                <p className="text-secondary text-sm font-label">Offers from</p>
                <h1 className="font-h3 text-h3 font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                  {restaurant.name}
                </h1>
              </div>
            </Link>
          </div>
        )}

        {/* Flash Sale Banner — hero deal, hidden while loading and when absent */}
        {loading ? (
          <Skeleton rounded="rounded-32" className="w-full h-100 mb-stack_lg" />
        ) : (
          <FlashSaleBanner
            formattedTime={formattedTime}
            copyPromoCode={copyPromoCode}
            copiedCode={copiedCode}
            offer={flashOffer}
          />
        )}

        {/* Search Bar */}
        <OffersFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Highlighted offers (Bento Style Layout) */}
        {!loading && (
          <NewUserDiscounts
            copyPromoCode={copyPromoCode}
            copiedCode={copiedCode}
            offers={newOffers}
          />
        )}

        {/* All Offers Grid */}
        <section className="mb-stack_lg">
          <div className="flex items-center justify-between mb-stack_md gap-4">
            <div className="flex items-center gap-3">
              <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-surface">All Offers</h2>
              {!loading && filteredOffers.length > 0 && (
                <span className="bg-primary-container/15 text-primary px-2.5 py-1 rounded-full font-label text-label">
                  {filteredOffers.length}
                </span>
              )}
            </div>
          </div>

          {loading && <OfferGridSkeleton count={4} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {!loading && filteredOffers.map((offer) => (
              <div
                key={offer._id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-16 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 group animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div className="relative h-48 overflow-hidden bg-surface-container-low">
                  {getOfferImage(offer) ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={offer.title}
                      loading="lazy"
                      src={getOfferImage(offer)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-container/25 to-tertiary-container/20 flex items-center justify-center">
                      <Icon name="local_offer" className="text-[56px] text-primary/50" />
                    </div>
                  )}
                  <div
                    className={`absolute top-3 left-3 font-bold px-3 py-1 rounded-lg text-small shadow-sm ${offer.type === 'EXCLUSIVE' ? 'bg-primary-container text-on-primary-container' : 'bg-primary text-on-primary'
                      }`}
                  >
                    {offer.type}
                  </div>
                  {offer.discountPercentage > 0 && (
                    <div className="absolute top-3 right-3 bg-error text-on-error font-bold text-sm px-2 py-1 rounded-lg shadow-sm">
                      -{offer.discountPercentage}%
                    </div>
                  )}
                  {offer.validUntil && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[12px] px-2 py-1 rounded-full">
                      <Icon name="schedule" className="text-[12px]" />{' '}
                      Valid until {new Date(offer.validUntil).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="p-4 grow flex flex-col justify-between">
                  <div>
                    {!activeRestaurantId && offer.restaurantId?.name && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant/30 shrink-0 flex items-center justify-center">
                          {offer.restaurantId.image ? (
                            <img
                              className="w-full h-full object-cover"
                              alt=""
                              aria-hidden="true"
                              loading="lazy"
                              src={offer.restaurantId.image}
                            />
                          ) : (
                            <Icon name="storefront" className="text-[16px] text-on-surface-variant" />
                          )}
                        </div>
                        <span className="font-button text-small text-on-surface truncate">
                          {offer.restaurantId.name}
                        </span>
                      </div>
                    )}
                    <h4 className="font-h3 text-[18px] mb-1 font-bold text-on-surface">
                      {offer.title}
                    </h4>
                    <p className="text-on-surface-variant text-small mb-4 line-clamp-2">
                      {offer.description}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => copyPromoCode(offer.code)}
                      className={`flex-1 py-3.5 rounded-xl border text-small font-button text-button transition-all text-center ${copiedCode === offer.code
                        ? 'bg-tertiary-container text-on-tertiary-container border-tertiary-container'
                        : 'border-primary text-primary hover:bg-primary hover:text-on-primary'
                        }`}
                    >
                      {copiedCode === offer.code ? 'Copied!' : 'Copy Code'}
                    </button>
                    <Link
                      to={`/restaurant/${offer.restaurantId?._id || activeRestaurantId}`}
                      className="px-4 py-3.5 rounded-xl bg-surface-container text-on-surface-variant hover:bg-primary hover:text-on-primary hover:shadow-sm font-button text-button text-center transition-all flex items-center justify-center"
                    >
                      <Icon name="restaurant_menu" className="text-[20px]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty search state */}
          {!loading && filteredOffers.length === 0 && (
            <OffersEmptyState 
              searchQuery={searchQuery} 
              activeRestaurantId={activeRestaurantId} 
              restaurantName={restaurant?.name} 
            />
          )}
        </section>

        {/* How it works */}
        <HowToSaveSection />

        {/* Newsletter Signup */}
        <Reveal>
          <NewsletterSignup
            newsletterSubscribed={newsletterSubscribed}
            handleNewsletterSubmit={handleNewsletterSubmit}
            newsletterEmail={newsletterEmail}
            setNewsletterEmail={setNewsletterEmail}
          />
        </Reveal>
      </main>

          </div>
  );
};

export default OffersPage;
