import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from './components/HomeNavbar';
import HomeFooter from './components/HomeFooter';
import RestaurantCard from '../../components/ui/RestaurantCard/RestaurantCard';
import '../../assets/styles/HomePage.css';

const FEATURED_RESTAURANTS = [
  {
    id: 'bella-cucina',
    name: 'Trattoria Bella',
    rating: '4.8 (500+)',
    tags: ['Italian', 'Pasta', 'Pizza'],
    time: '20-30 min',
    minOrder: 15,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXr7xHtYGkBB2ThYA9j-futbpaKsZ7oQV02EUu-_xTOAad7TqESELzbP6rbUvrxD0At464mjpHepQ3Gq79byJE-txDiMgrLn8wrLYcx9wDOW6FVxf0-4Aa6gL6nTLyOOOjjr8PZDaZcQkuvwW0C0jwvkpL2yPAw7k-KWn3O5RA_P9wKyRj7shXIZPZ4soTZCOqK6gTpy_60AoM-MNgNE8wWlG6lGev95FwkIarkZeUwVIgrt9DofI5Ug',
    freeDelivery: true,
    promo: true
  },
  {
    id: 'bella-cucina',
    name: 'Sakura Zen',
    rating: '4.9 (1.2k+)',
    tags: ['Japanese', 'Sushi', 'Ramen'],
    time: '35-45 min',
    minOrder: 25,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO6lauijc_oHvfEf0j0O7bEZIvWEeLu3jzTOKMx_kk9x2C2aBLpcdXeL3Ujyel3mHIl0r0oKZyV7Qv-AqygSKXioN28-X_ts_AKgM1t8ZdJtjQBkCPNOv94nmw1nxXqozFqgNBc3BQUCoMEtkjoWdrE44uaXfEdQ-kcYBFVjrC0b5k9PZBflmkKRUeHjzC09VhNoMukJP2-YdzCadP9m3hosF_dhA9p8CCqkqN7BVS4g5Wt2OdNnRnEg',
    freeDelivery: false,
    promo: false
  },
  {
    id: 'bella-cucina',
    name: 'El Taco Loco',
    rating: '4.6 (120+)',
    tags: ['Mexican', 'Tacos', 'Burritos'],
    time: '15-25 min',
    minOrder: 10,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn4JDoqi6o9jt7m6HVryXq9AZJGW7SUnOwgS03x_e-3LtW-NSvLO7JgEErSfcdo2YMFHY_vC4PqxpK_J3q1fLUEOd3beDO5CoIl8xL_wDz2JcxvQVGOCjXqMZYtulyfnHcWtLVcjZSInjqPBADteFy_a6Z_r5CQWaEDBSE3CTqDzN6XaISUcR3AHkWlEOnJcYgl-0s10vlANtcX2YfCz3Igbm4WcMFbKwo0tdfqyqdJXgCuFijtD7S7Q',
    freeDelivery: false,
    promo: false
  }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [addressInput, setAddressInput] = useState('');

  // Intersection Observer for fade-in animations on sections
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.animate-section');
    sections.forEach((section) => {
      // Initialize with start classes
      section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (addressInput.trim()) {
      navigate('/restaurant/bella-cucina');
    }
  };

  return (
    <>
      <HomeNavbar />
      <main>
        {/* Hero Section */}
        <section className="relative w-full min-h-[600px] flex items-center overflow-hidden animate-section">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA2AkxEVzhnfZ6ds67loIzbblNyQrrPF9RA3p3SAEui2dH4Yam1aYhs1Ybz-IgN3cdRJEdu4i8fhAnIblVbhhhMB3e-Z57oLgLtA2dWGNj3_Utmtm9Rq09Pcy-EiiuijMVOntlPPp03KOjtk2EcqYKbL2KEwIyHHi1rVALDddGu_ifUR0K50uZgE58GvrMabvR_HbRzt0FzobT1DysnHCFTI6rF9eOlz82tY9zc6JSpQwRixPQo7xXxwQ')`,
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-container_max mx-auto px-margin_desktop w-full py-stack_lg">
            <div className="max-w-2xl">
              <h1 className="font-h1 text-h1 text-on-background mb-stack_md">
                Delicious meals, <br />
                <span className="text-primary-container">delivered to your door.</span>
              </h1>
              <p className="text-body font-body text-secondary mb-stack_lg max-w-lg">
                Experience the finest culinary delights from your favorite local restaurants. Fast delivery, fresh food, and endless variety.
              </p>
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-0 bg-white p-2 rounded-2xl shadow-lg ring-1 ring-black/5 max-w-xl">
                <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-outline-variant py-3 md:py-0">
                  <span className="material-symbols-outlined text-primary-container mr-2">location_on</span>
                  <input
                    className="w-full border-none focus:ring-0 text-body bg-transparent outline-none"
                    placeholder="Enter delivery address"
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-container text-on-primary-container font-button px-stack_lg py-4 rounded-xl hover:opacity-90 transition-all active:scale-95 m-1"
                >
                  Find Food
                </button>
              </form>
              <div className="mt-stack_lg flex items-center gap-stack_md">
                <div className="flex -space-x-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white bg-surface-container bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5CsuJYjpv13-lhlNJndSKRXGbmjz8GcbnNCH8sGaCwawA_72IeEonmHtedYKWzYa27JN0nDU7DvpL-Ff35Si704T0LnPYxsJxXpOnxPTFwguhk41Q0-D3HXvdxgI3qnsGNypZXrh_utpAaE_TLzQHxJp730HnUQHy-05BqsJFecDfCCgJNpcS-Tk2VPgTIt9CojLGAoeQqrFIhw0CXPs-f0Ip-aN_aBJ2zLyhzbjBJcCR_i6OUYmTZA')`,
                    }}
                  ></div>
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white bg-surface-container bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3WGnYcQuPMV9i47CjYGaeKl9crM02gR9sG5mmZIH5KXtMRjQr2dKGQEV0nDIYyWRoDZbCYDPz2pgiWdCrswE6AMa10_lHYOJqMSywbyOor_RMoWtTWejDxFErlg9ycYVxmS2jjyBEZq_kEwlnzHFdNJgNXU76D2Vgh9MEzrnrp8GbLQblB7faWMjgADpuXLrIogEFLOlLj0pbYynU03EoJLT8zNeFDianTkKo-40aUdkP218HtxtHqg')`,
                    }}
                  ></div>
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white bg-surface-container bg-cover bg-center"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVtUDFDJjz57hMTBppoK6fP0fiCy9luILdYn6OiXcIEcacfJmW3-QAN4huoxXX6BcSY41slhaeNK85O8ggbcAqAnfr96KqdyOCP2ISMa1gVTt8OIacvxbUn6lw5ecRfZ_8PZK46gbdL4Ar8hJ0if7ovjGZ1eYjrEzor6hm5ahGi3rVjlOZWAttcxxymF9cA4D35Fl_2YaXKrlBO243CW7UxiPumTwbFyOnrwikF5wAy-w6x5DsmkF4_A')`,
                    }}
                  ></div>
                </div>
                <p className="text-small font-small text-secondary">
                  <span className="font-bold text-on-background">50k+</span> satisfied foodies near you
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Now */}
        <section className="py-stack_lg bg-surface-bright overflow-hidden animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="flex justify-between items-end mb-stack_lg">
              <div>
                <h2 className="font-h2 text-h2 text-on-background">Trending Now</h2>
                <p className="text-body font-body text-secondary">The most ordered dishes in your area right now</p>
              </div>
              <div className="flex gap-stack_sm">
                <button className="p-2 rounded-full border border-outline hover:bg-surface-container transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 rounded-full border border-outline hover:bg-surface-container transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="flex gap-gutter overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4">
              {/* Dish Card 1 */}
              <div
                onClick={() => navigate('/restaurant/bella-cucina')}
                className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-48 rounded-t-2xl overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCg7GLVL0BdBOFRo8zKJ8dZw7xYYuNtCr2rc2Mie1tGYfaa0YUcpVzF_jS-XEZLtdc6opZAMih-1Q9f2BED51H7d-Pqmgi5y0wa0TFur-Cf56vo2FSH6DpLi6k4zkWdrn0ovu95H6v2zbczDY6bXrpHDBk0-fUgIeYaB3lbAteeV-Gh2G6igL0hNyGs1rSUse1wrM4Q_UJOT3cCwtwW91sdHUOqzw1dMk_4iGNGCAWyZm_KfBjD-od__g')`,
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] fill">star</span> 4.9
                  </div>
                </div>
                <div className="p-stack_md">
                  <h3 className="font-h3 text-body font-bold text-on-background">Truffle Umami Burger</h3>
                  <p className="text-small font-small text-secondary mb-3">Burger King • $12.99</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/restaurant/bella-cucina');
                    }}
                    className="w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Add to Order
                  </button>
                </div>
              </div>

              {/* Dish Card 2 */}
              <div
                onClick={() => navigate('/restaurant/bella-cucina')}
                className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-48 rounded-t-2xl overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBGD3nSaowLOXhlZH5JGHYHjvYNe-WBTTCUsZerqJwh75dJJncj6XszCopvXq9eCmxkQd2boHj1tfoWfxJ_BPyU-cjtAjXSlEm8Hi0m9Raa9Nu9MHMVI6sPjabVjeqIwWIV7u7p5yb1v9pBZqkMPA5VsYwwjgH3hVN9t4Mb84yG0kLciapopykryo7lWWkjKRMrjRbbB_c_084lPBCN-S2To1wez5fhj2T3atg7dHdgLgAqsnTQLCKDfQ')`,
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] fill">star</span> 4.7
                  </div>
                </div>
                <div className="p-stack_md">
                  <h3 className="font-h3 text-body font-bold text-on-background">Spicy Salmon Poke</h3>
                  <p className="text-small font-small text-secondary mb-3">Island Bowls • $15.50</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/restaurant/bella-cucina');
                    }}
                    className="w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Add to Order
                  </button>
                </div>
              </div>

              {/* Dish Card 3 */}
              <div
                onClick={() => navigate('/restaurant/bella-cucina')}
                className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-48 rounded-t-2xl overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_UGxlISZhdH74fls00N6sv-Xlx6kNCFPr4-z1-rxVP-rMOp8qh4cr_0_kszA8FnY7kFREBxMc3ZYoqqzh0qIFOMHIvVxI4k0Dmek-apzuJBGnj8h0daHs8_z0WO1fzcYt7s-4uVc168rK7Qr3SmrqB9Xt1IzL9ZNQ0MgGeZ-aTPmAoF9VJvYI8u751N4DYYF8Uk20FURXIIMmAGiEWjlLnTZ3BaV5v-gE4a4xEv3SC6_0ECtbKdj0wQ')`,
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] fill">star</span> 4.8
                  </div>
                </div>
                <div className="p-stack_md">
                  <h3 className="font-h3 text-body font-bold text-on-background">Margherita Verace</h3>
                  <p className="text-small font-small text-secondary mb-3">Pasta & Co • $14.00</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/restaurant/bella-cucina');
                    }}
                    className="w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Add to Order
                  </button>
                </div>
              </div>

              {/* Dish Card 4 */}
              <div
                onClick={() => navigate('/restaurant/bella-cucina')}
                className="min-w-[280px] bg-white rounded-2xl border border-outline-variant hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="h-48 rounded-t-2xl overflow-hidden relative">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAbxJjE15VsmMJAfJIme5I_nZqbuWLpulyaPW_5NaSWux89uae6w3EERaAupzPD1uZ--CFF_CJPuA_bvSuavbkth70XeLZBpdDnoGwd954cq_rcCcRu8iWjB8X3Q_wkQjGM78-PtV5GzbqZh6BflOHMVBKuTMoOQgw6xcK6BvRn56vn7Mnvnoh_d9eWFw4P2Z_h-Z3q91T557v0lQzNjHuPQyWNUxQuN3zeYW6DvUIdzi2fc2uOuwn-SQ')`,
                    }}
                  ></div>
                  <div className="absolute top-3 right-3 bg-white/90 glass-effect px-2 py-1 rounded-lg text-primary font-bold text-label flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] fill">star</span> 4.9
                  </div>
                </div>
                <div className="p-stack_md">
                  <h3 className="font-h3 text-body font-bold text-on-background">Tonkotsu Special</h3>
                  <p className="text-small font-small text-secondary mb-3">Ramen Ichiraku • $16.20</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/restaurant/bella-cucina');
                    }}
                    className="w-full py-2 border-2 border-primary-container text-primary-container font-button rounded-xl hover:bg-primary-container hover:text-white transition-all"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-stack_lg bg-surface-container-low animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="text-center mb-stack_lg">
              <h2 className="font-h2 text-h2 text-on-background">Order in 3 easy steps</h2>
              <p className="text-body font-body text-secondary">Getting your favorite food has never been simpler</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-center">
              <div className="flex flex-col items-center p-stack_md">
                <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center mb-stack_md text-primary">
                  <span className="material-symbols-outlined text-[40px]">restaurant_menu</span>
                </div>
                <h3 className="font-h3 text-h3 mb-2">Select Your Meal</h3>
                <p className="text-body text-secondary">Browse through thousands of menus to find what you crave.</p>
              </div>
              <div className="flex flex-col items-center p-stack_md">
                <div className="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center mb-stack_md text-tertiary">
                  <span className="material-symbols-outlined text-[40px]">shopping_bag</span>
                </div>
                <h3 className="font-h3 text-h3 mb-2">Easy Checkout</h3>
                <p className="text-body text-secondary">Pay securely with multiple options and track your order live.</p>
              </div>
              <div className="flex flex-col items-center p-stack_md">
                <div className="w-20 h-20 rounded-full bg-secondary-fixed flex items-center justify-center mb-stack_md text-secondary">
                  <span className="material-symbols-outlined text-[40px]">delivery_dining</span>
                </div>
                <h3 className="font-h3 text-h3 mb-2">Enjoy Your Food</h3>
                <p className="text-body text-secondary">Sit back and relax while we bring the restaurant experience to you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Curated Collections */}
        <section className="py-stack_lg animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <h2 className="font-h2 text-h2 text-on-background mb-stack_lg">Curated Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Collection 1 */}
              <div
                onClick={() => navigate('/restaurant/bella-cucina')}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
              >
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkcCSQjv9f_t-y4OcqBzDvGVgmbMDcvInqqoyAYPfcM7tGyA3ICj_ysmv1Hs-oVTNWFRToP6vEplT3TzP4J3k89mPSzSgTeaH__Dfs-qa5LaSP-AXs1w4Hn_xZSPbptz0NnIVldaGcS2RFNSfyERNu-cf777fglOShbjHB9BYLCPZ9j48vShsyeeDrnKzPFKFw1DSV3btqTjaFNwJ1dzBPyjlhvfA5bhTY8fOlBqLUuNWJCNqf7tNDPA')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="bg-tertiary px-3 py-1 rounded-full text-label font-label mb-2 inline-block">Healthy</span>
                  <h3 className="font-h2 text-h3 font-bold">Healthy Bites</h3>
                  <p className="text-small opacity-80">Guilt-free delicious options</p>
                </div>
              </div>

              {/* Collection 2 */}
              <div
                onClick={() => navigate('/restaurant/bella-cucina')}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
              >
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4psLLZ6Ng0QAmqWxLchsxJUHBQizAR_zHNhz8DVo7tLxsg0oHSJnHN6MT3f1HiL_HxuGEh8eWz_9c9gIzW1HvCDZCDUEUCgjzS-E_49ugrP_w3Wb570qYiu3Oz91ioEOf77-xLWc0Q_3ZdE22vQNf-6x5yMrOTblMPBZSAGv4hE42JhRSD-FDbOqO2_QQf5rwUAXbZAxhNZ-KY1k9J5JcFRlugu_X3D8Qfx-JZ6WKEMIGYYkTn0PkaQ')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="bg-primary px-3 py-1 rounded-full text-label font-label mb-2 inline-block">Late Night</span>
                  <h3 className="font-h2 text-h3 font-bold">Midnight Cravings</h3>
                  <p className="text-small opacity-80">Open now for your hunger</p>
                </div>
              </div>

              {/* Collection 3 */}
              <div
                onClick={() => navigate('/restaurant/bella-cucina')}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
              >
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0_z76Zmu2hNW_j3uun1fnWJ_sieOkQXjphvEtOwpQ2aSL8c8Xf6gQuMsHp9-33kTRzy_z9_1CbTzorShV48y1hgBblE3yX1wiZl3xw_fJunrSwY4GABM7sv8eDU-F-dylPnMjVCIxlDbUKtavUTk69mELsNaJqB5HsJQrpvTxUH5e7rZqlJsHPoypO1Zq2QbuomWkIiTVy8aepOHj60GYz0rZDlhQN1iZ_1AftAfCkdSrawc00etKrA')`,
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="bg-secondary px-3 py-1 rounded-full text-label font-label mb-2 inline-block">Premium</span>
                  <h3 className="font-h2 text-h3 font-bold">Top Rated Near You</h3>
                  <p className="text-small opacity-80">Local favorites with 5 stars</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Restaurants */}
        <section className="py-stack_lg bg-surface animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="flex justify-between items-center mb-stack_lg">
              <h2 className="font-h2 text-h2 text-on-background">Featured Restaurants</h2>
              <button
                onClick={() => navigate('/restaurant/bella-cucina')}
                className="text-primary font-button flex items-center gap-1 hover:underline"
              >
                View all restaurants <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {FEATURED_RESTAURANTS.map((restaurant, idx) => (
                <RestaurantCard key={idx} restaurant={restaurant} />
              ))}
            </div>
          </div>
        </section>

        {/* App Promotion */}
        <section className="py-20 bg-inverse-surface text-on-primary animate-section">
          <div className="max-w-container_max mx-auto px-margin_desktop">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="font-h1 text-h2 md:text-h1 mb-stack_md text-white">Take Foodora with you</h2>
                <p className="text-body opacity-80 mb-stack_lg text-white/95">
                  Get the best delivery experience with our mobile app. Track your order in real-time, get exclusive app-only discounts, and order with a single tap.
                </p>
                <div className="flex flex-wrap gap-stack_md items-center">
                  <img
                    className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
                    alt="Apple App Store download badge"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfTOWO1R67QD3aFj5Ato6lsUgwR00HXa5T4RsSufWJ3f3-WhZU3YzX1QVJD11jieY6Y1c0Jcye1J_GgqrVgXf_vygnYZwWuObRMdaKP1ewMpM9cWMpPjgLXIKJY1t6v7hBLNbTxJsH_3nWEl6wkS77qJkWne97F0JvY9TNrl8d1aw1M82cZqQry15WaKu_MQvnQd8Sh4kg-Hzjs0VLn1zw8jVCx5FvzB1rJCUu9SBdplQyTfJzfaW72Q"
                  />
                  <img
                    className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
                    alt="Google Play Store download badge"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdWvnAsryayKXmpO_xrY2QyHMu0fp_ziebDnBK-J9M9bGCmPtFOhbnw2KwBdkTg1fgmSZ0Y3IP9LfSomYnaD4_nuVW_07blTwGbvadET7vKtgmjNy0N6z_eDTofph_i7YzdKBTx1m0Ao7MevNiGgDrWmBl_W5LuBq1MCVThC-CWhCKI2iSlsovHen5WYFsfq3nlfSdHwKy1VbPSFMZQczEpI6CVo6BYb1ZUgiP3w4NLhCt2CCKQ9BOiw"
                  />
                </div>
                <div className="mt-stack_lg p-6 bg-white/10 rounded-2xl inline-flex items-center gap-6 backdrop-blur-sm">
                  <div className="bg-white p-2 rounded-xl">
                    <img
                      className="w-24 h-24"
                      alt="Foodora QR Code"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8i7g1OicgQKRGhM--_VXc4YjwrRleZPHUw8M5kV9GgXjf0bC8F9NV35Enn2E67CaiBCT9raatwB9Nt6KpOf_Djm5bx9dPeyURvOALmr7VZ2NT-iYhcKl4GmgewS26nlvZyASSmolQdgQBHSJ0BwYiQBtB_StSDIcWMGp7QipZFixMZMjKWleIKJKz_028eP1vegP7FxoO5o7isd1MJKtGbKyDBbWzRPxHl8HDqaFqXc1tcSk1z_Csiw"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-body text-white">Scan to download</p>
                    <p className="text-small opacity-70 text-white/80">Available for iOS &amp; Android</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative z-10 w-full max-w-sm mx-auto">
                  <img
                    className="w-full drop-shadow-2xl"
                    alt="Smartphone App Mockup"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL663zqzTVmvIMmka4NYhmo9SHL8N7-1-AepZ6_GUFy1z2H06Oc71UwH5b79JujQ6IC-K_e3UY2TGryKJf24K0RE38_Q-bNcKZ1m8wcan7VDo_4jxblVI8qkx91rzWmUVXMfDV6PctMEsH6Ap_gChNc7j1DnqmjBzb8uLQWsGeX0yPAIjZk1mldf9esya391tLOqpbOhBGLSLwULsn2hAghs8AABX1r6GZF6KB3n6eoz3WI_bkcAnEnA"
                  />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-container/20 rounded-full blur-[100px] z-0"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </>
  );
};

export default HomePage;
