import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import NewsletterSignup from './components/NewsletterSignup';
import FlashSaleBanner from './components/FlashSaleBanner';
import OffersFilter from './components/OffersFilter';
import NewUserDiscounts from './components/NewUserDiscounts';

// Dynamic list of promotions and deals
const OFFERS_DATA = [
  {
    id: 'bogo-burger',
    type: 'BOGO',
    restaurant: 'Burger Theory',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAURaMYrzmdPpz3yO2fblUdSDMD5WUJWTJuIkDJBYHy-q-QEbUgpBjZYeXi6F-WsBB9NqRscznY2RB9JhFByeHpbxw_52mlgUewnGq3hZow6YrnVIPSS0ntDJOzcTmpMBqmJjHxpoqCcpeHL81NCvCkDrzzcE7iXS4C4tnOlXXdKHAacGfzApG4Z5JyS30yNJ_Fi0yfzmU6FP_PFpsALUkoM5OW-os5WQggqlg0fIfS9ShcwlnQ18kNQ',
    title: 'Double Classic Burger',
    description: 'Applicable on all Classic & Specialty burgers.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1auuzHQXfGBE-aNPB34ROpo0uFPWkwzvGDj7l4dv_fxFbBY62btB3M2Jmx0JzOYYOx6WBjZpE-M_wDgsxseO-pDLsdo9fupS__ohBx3GgU4HEJxPYq6BSAHpPf1RosY_TASAUM3EFEEf2D94iD8D56IXuXJOImbscxvQD26O7BOBCvpfkAGg9tZWrrCu3_xKIxg9ZJ8AvppsfQ7yUzKgL-wddyAN2glmCe-itd8PhUkAAzdix9g7UuQ',
    expiry: 'Expires in 2 days',
    code: 'BOGOBURG',
  },
  {
    id: 'bogo-sushi',
    type: 'BOGO',
    restaurant: 'Sakura Sushi',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDR0psMFAjbJheHAost2oHcJPfy1pctKPksNEihdVl32WRTO_B3ZBRr4IIFPLVRPhfsFWJc6jYGYALNx3qfkMvewJM5KBtjyR7jTau4StGhoih0OT_Q4SYDNc_UvBcyUMJevdOFoH5dwjqSmj-sQacmUsXMjlvTMvszNVIQ7anPl8Eu9VvCg0qrMrcJMdVDAmDcpT6woft3kqnXCF4gOsfU9hlyOWddAvEQiapOBwWYaHPTBNeDy2HoQ',
    title: 'Crunchy Roll Combo',
    description: 'Buy any signature roll, get a second one free.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFvzAxt8N2ql_weP0OdeppuDiPgVVnVK4vn_Yvic7mg64WjGhPCyElORBg5jss5EErZ5aL0Y_icFMAu9XU2cnABerz22YbCgNs7DDwBxgULzKQh6woWeBY4pZiApEcBA5KlXeEMgxj370Fh2A0rEBFjJWHlsh8YoPv61qWbmKotaSC7dlIpo36M6i4BGglo9rCpuFX246cJZlB_QTt3XP-ktXgcje43MXPmNct7gOuE3LI1U09sG15Vg',
    expiry: 'Limited Time',
    code: 'BOGOSUSHI',
  },
  {
    id: 'bogo-pizza',
    type: 'BOGO',
    restaurant: "Luigi's Pizza",
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXQFQge6Qw84e_MLkwjFjlqpr208L3EW5K82-IjOG2VepyJaCIXP2jbT1KCCkX0yD5m0SyaT9z24P-d4pWfF5GucT5ApiXVto-DE1dhYooMK_mhydsSqRdZJinFk9VpL_TdLG4jAfgWsM_yDqNVcyx2tHuy8d810FocZfC-R4NpWV4vRUTgbfQuU5Tvy1lkGbGmekeXOGt2EHlmmrKmgiw_8Mo6fMWwXmxs8v8WQvH_gsEeUDMqYBYAA',
    title: 'Any Large Pizza',
    description: 'Excludes customized toppings. T&C apply.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUekzqKiIVpCifGUdd-ffJ7t18FHsnoR_TRYcpGqUNYUOCFqo3L-BRMM1BE-5RNfCBLp6qAis1cFs8rqZdGKVVaLY5xos8yDRxBH7EM5OAVOQKbJDizmh75EIutk7Pe-wjlWuJTdI30W1l5kaNfwS6iBoyFBa0W2kEzhTV_qTQLJISjzcrKW0H6qbUlHf4hL2WGtsLWlhFIt_jLVKMWLwseeps8GTJego5okv-AUteOrHN9fErppRWYQ',
    expiry: 'Weekend Special',
    code: 'BOGOPIZZA',
  },
  {
    id: 'exclusive-taco',
    type: 'EXCLUSIVE',
    restaurant: 'Taco Lab',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACFceSK_MCE11YMCPQiALjUwmdpjeebNpvzMrNpgBk9PkALXayIXQL4cSg09d1hvkCjkIvrAqklomSKcQK3bZJXY7I1SAXMeFYfc6wJefg3Z-bclMbFmWn0NpSJBCW1LdJ0S8jONevVrTJSqCJcBF9vtnxT7blR-QDO7_HbyGoaWqoYIS1hjTRzsQmnKqUOHMb6QstySulwUC8lGZVddF4O8sKF3cAicEEmQoy4Edgn4xAabad_H7lFQ',
    title: '$10 OFF Order',
    description: 'Exclusive for Foodora Pro members.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbJXSBnaDup6cDfPEj8EnGUFJxbQyt6Y_r033xxmu5umCcYdN7dRXalrBzu-_opqoyOY6QZdPvjNkGc7NPsl1S2hZR6Eq3VOVFIyuu-9mZE8oYADr_kRcL8Yj3HC5elmeoZqRIPBn-Lj1eLlNd_mPxvZt8BmsD1NlRUGmgASTEKbwkK6EjE9MqkKQOZeUKv7sC5RRzeMxRCOqMqGihy5ZbqrasQjyilsDWZ794rxJltq-HiWvJgthWtA',
    expiry: 'Pro Exclusives',
    code: 'TACO10',
  },
];

const OffersPage = () => {
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / Clipboard notifications state
  const [copiedCode, setCopiedCode] = useState('');

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Countdown timer state: 2h 45m 12s -> 9912 seconds total
  const [timeLeft, setTimeLeft] = useState(9912);

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
    if (!searchQuery.trim()) return OFFERS_DATA;
    return OFFERS_DATA.filter(
      (offer) =>
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
                key={offer.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-[16px] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
              >
                <div className="relative h-48 overflow-hidden bg-surface-container-low">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={offer.title}
                    src={offer.image}
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
                    {offer.expiry}
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Restaurant Logo and Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant/30 flex-shrink-0">
                        <img
                          className="w-full h-full object-cover"
                          alt={offer.restaurant}
                          src={offer.logo}
                        />
                      </div>
                      <span className="font-button text-small text-on-surface truncate">
                        {offer.restaurant}
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
                      to="/restaurant/bella-cucina"
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
