import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Icon from '../../components/common/Icon';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDebounce } from '../../helper/useDebounce';
import TopNavBar from '../../components/globalComponents/Navbar';
import HomeFooter from '../../components/globalComponents/HomeFooter';
import NewsletterSignup from '../../components/homeScreen/offersComponents/NewsletterSignup';
import FlashSaleBanner from '../../components/homeScreen/offersComponents/FlashSaleBanner';
import OffersFilter from '../../components/homeScreen/offersComponents/OffersFilter';
import NewUserDiscounts from '../../components/homeScreen/offersComponents/NewUserDiscounts';
import api from '../../api/axios';
import { OfferGridSkeleton, Skeleton } from '../../components/common/Skeleton';
import { Reveal } from '../../components/common/Reveal';
import FastBitesLogo from '../../assets/images/FastBitesLogo.png';

/**
 * Resolves a usable image for an offer card.
 *
 * The API stores 'no-photo.jpg' as its "no image" sentinel and may omit the
 * field entirely. The previous expression (`offer.image !== 'no-photo.jpg'`)
 * was true for `undefined` too, so cards with no image rendered `src={undefined}`
 * and showed a broken-image icon.
 */
const getOfferImage = (offer) => {
  const candidates = [offer?.image, offer?.restaurantId?.image, offer?.restaurantId?.images?.banner];
  return candidates.find((src) => src && src !== 'no-photo.jpg') || null;
};

const OffersPage = () => {
  // ── URL param: present when navigated via /restaurant/:id/offers ──────────
  // If :id is in the URL we are in restaurant-specific mode.
  const { id: urlRestaurantId } = useParams();

  // ── Fallback context from Redux (cart / previously visited restaurant) ─────
  const { restaurantId: cartRestaurantId } = useSelector((state) => state.cart);
  const { currentRestaurant } = useSelector((state) => state.restaurants);

  // URL param takes highest priority; without it we fall back to Redux context.
  // If nothing is available → show ALL offers (global /offers route).
  const activeRestaurantId = urlRestaurantId || cartRestaurantId || currentRestaurant?._id;

  // Subscribe modal only appears on restaurant-specific pages, never on global
  const showSubscribeModal = !!activeRestaurantId;

  // ── State ─────────────────────────────────────────────────────────────────
  const [offersData, setOffersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);   // only set in restaurant mode
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [copiedCode, setCopiedCode] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // ── Countdown timer — starts at 0, synced to flashOffer.validUntil ─────────
  const [timeLeft, setTimeLeft] = useState(0);

  // ── Fetch offers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        if (activeRestaurantId) {
          // Restaurant-specific mode: fetch offers + restaurant info in parallel
          const [offersRes, restRes] = await Promise.all([
            api.get(`/offers/active?restaurantId=${activeRestaurantId}`),
            api.get(`/restaurants/${activeRestaurantId}`)
          ]);
          setOffersData(offersRes.data.data || []);
          setRestaurant(restRes.data.data || null);
        } else {
          // Global mode: fetch all active offers from every restaurant
          const res = await api.get('/offers/active');
          setOffersData(res.data.data || []);
          setRestaurant(null);
        }
      } catch (err) {
        console.error('Failed to load offers', err);
        setOffersData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [activeRestaurantId]);

  // ── Derived: the flash offer is the one with the highest discount ──────────
  const flashOffer = useMemo(() => {
    return offersData.slice().sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))[0] || null;
  }, [offersData]);

  // ── Sync timer to the real validUntil of the flash offer ──────────────────
  useEffect(() => {
    if (!flashOffer?.validUntil) {
      setTimeLeft(0);
      return;
    }
    const secondsLeft = Math.max(0, Math.floor((new Date(flashOffer.validUntil) - Date.now()) / 1000));
    setTimeLeft(secondsLeft);
  }, [flashOffer]);

  // ── Countdown tick ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // ── Derived display values ────────────────────────────────────────────────
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

  const filteredOffers = useMemo(() => {
    if (!offersData || !Array.isArray(offersData)) return [];
    if (!debouncedSearchQuery.trim()) return offersData;

    return offersData.filter(offer =>
      offer.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (offer.restaurantId?.name || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (offer.description || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [debouncedSearchQuery, offersData]);

  const newOffers = useMemo(() => {
    const filtered = offersData.filter(o => o._id !== flashOffer?._id);
    return {
      welcome: filtered[0] || null,
      delivery: filtered[1] || null
    };
  }, [offersData, flashOffer]);

  // ── Helpers ───────────────────────────────────────────────────────────────
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
        // If activeRestaurantId is undefined, it becomes a global subscription
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
      <TopNavBar />

      <main className="max-w-container_max mx-auto px-margin_mobile md:px-margin_desktop py-stack_lg grow w-full">

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
                    // No image on the offer or its restaurant. A branded tile
                    // beats a broken-image icon or a dead placeholder host.
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
                    {/* Restaurant info — shown in global mode */}
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
            <div className="bg-surface-container-lowest rounded-16 p-12 text-center border border-outline-variant/30 mt-8 shadow-sm">
              <Icon name="search_off" className="text-4xl text-on-secondary-container mb-2" />
              <h3 className="font-h3 text-h3 text-on-surface mb-2">No promotions found</h3>
              <p className="text-on-surface/80 max-w-md mx-auto">
                {searchQuery
                  ? `We couldn't find any deals matching "${searchQuery}". Try checking the spelling or using different keywords.`
                  : activeRestaurantId
                    ? `${restaurant?.name || 'This restaurant'} hasn't added any active promotions yet. Check back soon!`
                    : 'No active offers available right now. Check back soon!'}
              </p>
            </div>
          )}
        </section>

        {/* How it works */}
        <Reveal as="section" className="bg-surface-container-high rounded-32 p-8 md:p-12 mb-stack_lg overflow-hidden relative shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-stack_lg items-center">
            <div>
              <h2 className="font-h2 text-h2-mobile md:text-h2 text-on-surface mb-6">How to save more</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 shadow-md">1</div>
                  <div>
                    <h4 className="font-h3 text-[18px] mb-1 font-semibold text-on-surface">Choose your favorite deal</h4>
                    <p className="text-on-surface/80 text-body">Browse through hundreds of offers from top-rated restaurants in your city.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 shadow-md">2</div>
                  <div>
                    <h4 className="font-h3 text-[18px] mb-1 font-semibold text-on-surface">Add to Cart</h4>
                    <p className="text-on-surface/80 text-body">Eligible deals are automatically applied. For promo codes, enter them at the final checkout stage.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 shadow-md">3</div>
                  <div>
                    <h4 className="font-h3 text-[18px] mb-1 font-semibold text-on-surface">Enjoy your meal!</h4>
                    <p className="text-on-surface/80 text-body">Sit back and relax. Your food is on the way, at a price you'll love.</p>
                  </div>
                </div>
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

      <HomeFooter />
    </div>
  );
};

export default OffersPage;
