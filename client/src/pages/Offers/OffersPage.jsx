import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TopNavBar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';


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
        <section className="relative w-full rounded-[32px] overflow-hidden mb-stack_lg min-h-[400px] flex items-center shadow-md">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent"></div>
          <div className="relative z-10 p-8 md:p-16 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full font-label text-label mb-4 animate-pulse">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              FLASH SALE
            </div>
            <h1 className="font-h1 text-h1-mobile md:text-h1 mb-4 leading-tight">Today's Top Deals</h1>
            <p className="font-body text-body text-white/90 mb-8 max-w-md">
              Satisfy your cravings for less. Exclusive discounts on the city's finest restaurants, only for the next few hours.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* React-based Countdown Display */}
              <div className="flex gap-4" id="countdown">
                <div className="flex flex-col items-center">
                  <span className="text-h2 font-h2">{formattedTime.hours}</span>
                  <span className="font-label text-[10px] uppercase opacity-70">Hours</span>
                </div>
                <span className="text-h2 font-h2">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-h2 font-h2">{formattedTime.minutes}</span>
                  <span className="font-label text-[10px] uppercase opacity-70">Mins</span>
                </div>
                <span className="text-h2 font-h2">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-h2 font-h2">{formattedTime.seconds}</span>
                  <span className="font-label text-[10px] uppercase opacity-70">Secs</span>
                </div>
              </div>
              <button
                onClick={() => copyPromoCode('FLASH80')}
                className="bg-primary-container text-white px-8 py-4 rounded-xl font-button text-button hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined">confirmation_number</span>
                {copiedCode === 'FLASH80' ? 'Code Copied!' : 'Claim Flash Deal (80% Off)'}
              </button>
            </div>
          </div>
        </section>

        {/* Search Bar for Offers */}
        <div className="mb-stack_lg max-w-md">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-secondary-container">
              search
            </span>
            <input
              className="w-full h-12 pl-12 pr-4 rounded-12 border border-surface-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body text-body transition-shadow shadow-sm"
              placeholder="Search deals or restaurants..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* New User Discounts (Bento Style Layout) */}
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
        <section className="bg-inverse-surface rounded-[24px] p-8 md:p-16 text-center relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-tertiary/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-primary-fixed text-[48px] mb-4">
              mail
            </span>
            <h2 className="font-h2 text-h2-mobile md:text-h2 text-white mb-4">
              Never miss a tasty deal
            </h2>
            <p className="text-surface-variant/80 font-body text-body mb-8">
              Join 50,000+ foodies receiving the best weekly promotions directly in their inbox.
            </p>

            {newsletterSubscribed ? (
              <div className="bg-white/10 text-white p-6 rounded-xl border border-white/20 backdrop-blur-sm max-w-lg mx-auto flex items-center justify-center gap-3 animate-in fade-in zoom-in-95">
                <span className="material-symbols-outlined text-[32px] text-tertiary-fixed">
                  check_circle
                </span>
                <div className="text-left">
                  <h4 className="font-button text-button">Successfully Subscribed!</h4>
                  <p className="text-small text-surface-variant/80">
                    We've sent a welcome email to your inbox.
                  </p>
                </div>
              </div>
            ) : (
              <form
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
                onSubmit={handleNewsletterSubmit}
              >
                <input
                  className="flex-grow px-6 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary bg-white/10 text-white placeholder-white/50 backdrop-blur-sm outline-none font-body text-body"
                  placeholder="Enter your email address"
                  required
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-button hover:opacity-90 active:scale-95 transition-all shadow-lg whitespace-nowrap"
                  type="submit"
                >
                  Subscribe Now
                </button>
              </form>
            )}

            <p className="mt-4 text-[12px] text-surface-variant/50">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default OffersPage;
