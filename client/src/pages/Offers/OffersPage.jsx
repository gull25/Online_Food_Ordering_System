import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import NewsletterSignup from './components/NewsletterSignup';
import FlashSaleBanner from './components/FlashSaleBanner';
import OffersFilter from './components/OffersFilter';
import NewUserDiscounts from './components/NewUserDiscounts';
import api from '../../api/axios';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const OffersPage = () => {
  // Offers state
  const [offersData, setOffersData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / Clipboard notifications state
  const [copiedCode, setCopiedCode] = useState('');

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Countdown timer state: 2h 45m 12s -> 9912 seconds total
  const [timeLeft, setTimeLeft] = useState(9912);

  // Get active restaurant context
  const { restaurantId: cartRestaurantId } = useSelector((state) => state.cart);
  const { currentRestaurant } = useSelector((state) => state.restaurants);
  const activeRestaurantId = cartRestaurantId || currentRestaurant?._id;

  // Fetch dynamic offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const url = activeRestaurantId ? `/offers/active?restaurantId=${activeRestaurantId}` : '/offers/active';
        const res = await api.get(url);
        setOffersData(res.data.data || []);
      } catch (err) {
        console.error('Failed to load offers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [activeRestaurantId]);

  // Handle countdown ticking
  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Convert remaining seconds into hours, minutes, and seconds
  const formattedTime = useMemo(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  }, [timeLeft]);

  // Filter BOGO & Exclusive deals based on search query
  const filteredOffers = useMemo(() => {
    if (!searchQuery.trim()) return offersData;
    return offersData.filter(
      (offer) =>
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.restaurantId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, offersData]);

  // Copy promo code helper
  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Newsletter subscribe handler
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-background text-on-background font-body min-h-screen relative flex flex-col">
      <TopNavBar />

      <main className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg flex-grow w-full">
        {/* Flash Sale Banner */}
        <FlashSaleBanner 
          formattedTime={formattedTime} 
          copyPromoCode={copyPromoCode} 
          copiedCode={copiedCode} 
        />

        {/* Search Bar for Offers */}
        <OffersFilter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* New User Discounts (Bento Style Layout) */}
        <NewUserDiscounts copyPromoCode={copyPromoCode} copiedCode={copiedCode} />

        {/* BOGO & Exclusive Deals Section */}
        <section className="mb-stack_lg">
          <div className="flex items-center justify-between mb-stack_md">
            <div className="flex items-center gap-3">
              <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-surface">Buy One Get One</h2>
              <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded font-label text-[10px] font-extrabold animate-bounce">
                HOT
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {filteredOffers.map((offer) => (
              <div
                key={offer._id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
              >
                <div className="relative h-48 overflow-hidden bg-surface-container-low">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={offer.title}
                    src={offer.image !== 'no-photo.jpg' ? offer.image : (offer.restaurantId?.image || 'https://via.placeholder.com/400x300')}
                  />
                  <div
                    className={`absolute top-3 left-3 font-bold px-3 py-1 rounded-lg text-small text-white shadow-sm ${
                      offer.type === 'EXCLUSIVE' ? 'bg-primary-container' : 'bg-primary'
                    }`}
                  >
                    {offer.type}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>{' '}
                    Valid until {new Date(offer.validUntil).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Restaurant Logo and Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant/30 flex-shrink-0">
                        <img
                          className="w-full h-full object-cover"
                          alt={offer.restaurantId?.name}
                          src={offer.restaurantId?.image || 'https://via.placeholder.com/150'}
                        />
                      </div>
                      <span className="font-button text-small text-on-surface truncate">
                        {offer.restaurantId?.name}
                      </span>
                    </div>
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
                      className={`flex-1 py-3.5 rounded-xl border text-small font-button text-button transition-all text-center ${
                        copiedCode === offer.code
                          ? 'bg-tertiary-container text-white border-tertiary-container'
                          : 'border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      {copiedCode === offer.code ? 'Copied!' : 'Copy Code'}
                    </button>
                    <Link
                      to={`/restaurant/${offer.restaurantId?._id}`}
                      className="px-4 py-3.5 rounded-xl bg-surface-container text-on-surface-variant hover:bg-primary-container hover:text-white hover:shadow-sm font-button text-button text-center transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[20px]">restaurant_menu</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty search state */}
          {filteredOffers.length === 0 && (
            <div className="bg-surface-container-lowest rounded-16 p-12 text-center border border-outline-variant/30 mt-8 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-on-secondary-container mb-2">
                search_off
              </span>
              <h3 className="font-h3 text-h3 text-on-surface mb-2">No promotions found</h3>
              <p className="text-secondary max-w-md mx-auto">
                We couldn't find any deals matching "{searchQuery}". Try checking the spelling or
                using different keywords.
              </p>
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="bg-surface-container-high rounded-[32px] p-8 md:p-12 mb-stack_lg overflow-hidden relative shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack_lg items-center">
            <div>
              <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-surface mb-6">How to save more</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                    1
                  </div>
                  <div>
                    <h4 className="font-h3 text-[18px] mb-1 font-semibold text-on-surface">
                      Choose your favorite deal
                    </h4>
                    <p className="text-on-secondary-container text-body">
                      Browse through hundreds of offers from top-rated restaurants in your city.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                    2
                  </div>
                  <div>
                    <h4 className="font-h3 text-[18px] mb-1 font-semibold text-on-surface">Add to Cart</h4>
                    <p className="text-on-secondary-container text-body">
                      Eligible deals are automatically applied. For promo codes, enter them at the final checkout stage.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                    3
                  </div>
                  <div>
                    <h4 className="font-h3 text-[18px] mb-1 font-semibold text-on-surface">Enjoy your meal!</h4>
                    <p className="text-on-secondary-container text-body">
                      Sit back and relax. Your food is on the way, at a price you'll love.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block h-[400px]">
              <img
                className="w-full h-full object-contain rounded-2xl"
                alt="Smartphone showing discount applied screen"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0L7M4U-X5RDhfOZLk1cMV3SwuSUvpG_Z1PmStcizeL2CMV43-TUUrKSz6utpUSNK63m210YYXtP2rGoETQzItHpkQ69PhXnfXqw80VEXyHEoD6d3wrFmKpx2HUYo_gtkPDISe8g6C72Ex9zaV5G8jp7TGEe934wo8Hih6lhmARpZ-rMIokqAF2FojAaLiQ5ymC-j7Qeg2Uzjk1Y9sPmDxgsNbZvfktyZk50DQF_wJ0THMK3V6VbFalA"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce border border-surface-variant">
                <span className="material-symbols-outlined text-tertiary text-[32px]">
                  check_circle
                </span>
                <div>
                  <p className="font-bold text-on-surface">Savings Applied!</p>
                  <p className="text-small text-on-surface-variant">You saved $22.50</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <NewsletterSignup
          newsletterSubscribed={newsletterSubscribed}
          handleNewsletterSubmit={handleNewsletterSubmit}
          newsletterEmail={newsletterEmail}
          setNewsletterEmail={setNewsletterEmail}
        />
      </main>

      <Footer />
    </div>
  );
};

export default OffersPage;
