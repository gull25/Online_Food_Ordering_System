import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const METRICS_DATA_SET = {
  'Last 7 Days': {
    revenue: '$248,590',
    revenueGrowth: '+4%',
    aov: '$45.10',
    aovGrowth: '+2%',
    growth: '14.2%',
    growthGrowth: '+1.5%',
    orders: '8,420',
    ordersGrowth: '-0.3%',
    linePath: 'M0,90 Q10,75 20,82 T40,65 T60,55 T80,40 T100,50',
    prevLinePath: 'M0,95 Q10,90 20,92 T40,80 T60,72 T80,55 T100,65',
    areaPath: 'M0,90 Q10,75 20,82 T40,65 T60,55 T80,40 T100,50 V100 H0 Z',
    weeks: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
  },
  'Last 30 Days': {
    revenue: '$1,284,590',
    revenueGrowth: '+12%',
    aov: '$42.80',
    aovGrowth: '+5%',
    growth: '18.5%',
    growthGrowth: '+2.4%',
    orders: '32,450',
    ordersGrowth: '-0.8%',
    linePath: 'M0,80 Q10,70 20,75 T40,40 T60,50 T80,20 T100,30',
    prevLinePath: 'M0,90 Q10,85 20,88 T40,60 T60,70 T80,45 T100,55',
    areaPath: 'M0,80 Q10,70 20,75 T40,40 T60,50 T80,20 T100,30 V100 H0 Z',
    weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  },
  'Last 90 Days': {
    revenue: '$3,942,000',
    revenueGrowth: '+18%',
    aov: '$40.50',
    aovGrowth: '+8%',
    growth: '22.4%',
    growthGrowth: '+3.1%',
    orders: '98,200',
    ordersGrowth: '+1.2%',
    linePath: 'M0,70 Q10,50 20,60 T40,30 T60,45 T80,15 T100,25',
    prevLinePath: 'M0,85 Q10,75 20,80 T40,50 T60,65 T80,35 T100,45',
    areaPath: 'M0,70 Q10,50 20,60 T40,30 T60,45 T80,15 T100,25 V100 H0 Z',
    weeks: ['Month 1', 'Month 2', 'Month 3'],
  },
  'Last Year': {
    revenue: '$14,842,500',
    revenueGrowth: '+25%',
    aov: '$38.90',
    aovGrowth: '+10%',
    growth: '28.1%',
    growthGrowth: '+4.5%',
    orders: '412,000',
    ordersGrowth: '+3.4%',
    linePath: 'M0,60 Q10,40 20,50 T40,20 T60,30 T80,10 T100,15',
    prevLinePath: 'M0,75 Q10,65 20,70 T40,40 T60,55 T80,25 T100,35',
    areaPath: 'M0,60 Q10,40 20,50 T40,20 T60,30 T80,10 T100,15 V100 H0 Z',
    weeks: ['Q1', 'Q2', 'Q3', 'Q4'],
  },
};

const HOTSPOTS = [
  { id: 'central', district: 'Central District', efficiency: '94%', activeOrders: 142, top: '20%', left: '30%' },
  { id: 'northside', district: 'Northside District', efficiency: '89%', activeOrders: 98, top: '60%', left: '70%' },
  { id: 'westside', district: 'Westside District', efficiency: '91%', activeOrders: 65, top: '40%', left: '50%' },
];

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();

  // Active States
  const [activeRange, setActiveRange] = useState('Last 30 Days');
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);

  // Selected Map Hotspot details
  const [selectedHotspot, setSelectedHotspot] = useState(HOTSPOTS[0]);

  // Modal State for adding new restaurant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineType, setCuisineType] = useState('Italian');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddRestaurant = (e) => {
    e.preventDefault();
    if (restaurantName.trim()) {
      showToast(`Restaurant "${restaurantName}" successfully added!`);
      setIsModalOpen(false);
      setRestaurantName('');
    }
  };

  const handleStartVerificationBatch = () => {
    showToast('Starting verification batch...');
    setTimeout(() => {
      showToast('Verification batch completed successfully.');
    }, 1500);
  };

  const currentStats = useMemo(() => {
    return METRICS_DATA_SET[activeRange];
  }, [activeRange]);

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Styles inject support */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(229, 231, 235, 0.5);
        }
      `}</style>

      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[70] bg-inverse-surface text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-primary-fixed">info</span>
          <span className="font-button text-button text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Restaurant Add Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-gutter border border-outline-variant/30 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">Add New Restaurant</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddRestaurant} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-secondary">Restaurant Name *</label>
                <input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body text-body"
                  placeholder="e.g. Pizza Gourmet"
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-secondary">Cuisine Type *</label>
                <select
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body text-body"
                >
                  <option value="Italian">Italian</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Vegan">Vegan</option>
                  <option value="American">American</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-xl border border-outline-variant/30 text-secondary font-button text-button hover:bg-surface-variant/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-primary text-white font-button text-button hover:opacity-90 transition-colors shadow-md"
                >
                  Add Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SideNavBar Anchor */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low dark:bg-inverse-surface z-50">
        <div className="px-6 py-8">
          <h1 className="font-h3 text-h3 text-primary dark:text-primary-fixed font-bold leading-tight">Foodora Admin</h1>
          <p className="font-label text-label text-secondary opacity-70">Management Suite</p>
        </div>
        <nav className="flex-1 mt-4 space-y-1">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-4 px-6 py-4 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-variant transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-4 px-6 py-4 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-variant transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span>Orders</span>
          </button>
          <button
            onClick={() => navigate('/admin/restaurants')}
            className="flex items-center gap-4 px-6 py-4 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-variant transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined">storefront</span>
            <span>Restaurants</span>
          </button>
          <button
            onClick={() => navigate('/admin/menu')}
            className="flex items-center gap-4 px-6 py-4 text-secondary dark:text-secondary-fixed-dim hover:bg-surface-variant transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined">restaurant_menu</span>
            <span>Menu Management</span>
          </button>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-4 px-6 py-4 text-primary dark:text-primary-fixed font-bold border-r-4 border-primary bg-surface-container transition-all duration-200 w-full text-left font-label text-label cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              analytics
            </span>
            <span>Analytics</span>
          </button>
        </nav>
        <div className="p-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-primary-container text-white font-button text-button py-3 px-4 rounded-xl shadow-sm hover:opacity-90 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-white">add_circle</span>
            Add New Restaurant
          </button>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex-shrink-0">
              <img
                className="w-full h-full object-cover"
                alt="Tech administrator headshot"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAvdb8YS0kJnrv4celmWi8pMTrlJb5J-_Ht1oZQu7t4XhpuNhlE033Wt0IHKVGLZ74YC5tNTui_KNKgtO4P-6g0B1woKQWvjTuZEhTKyvXFECAE6T-AiGJSVYfG0WJl-ozef-Lar-9P1u9ML4lmHEXm0XiIFNfcXU6bXg2Jakw-I0OIT3rmlVtvlxg8_lqtJ95UEte2KWDImZkrA8bQf5vDZS-vNguuXk5rD9B-v-QbNvecemE5D0ARA"
              />
            </div>
            <div>
              <p className="font-label text-label text-on-surface font-bold">Admin Profile</p>
              <p className="text-[10px] text-secondary">Chief Operations</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-64 flex-1">
        {/* Header */}
        <header className="sticky top-0 w-full h-[72px] z-40 bg-surface-container-lowest shadow-sm flex items-center justify-between px-margin_desktop border-b border-outline-variant/20">
          <div className="flex flex-col">
            <h2 className="font-h3 text-h3 text-on-surface font-bold">Analytics Insights</h2>
          </div>
          <div className="flex items-center gap-gutter relative">
            <div className="relative group">
              <button
                onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
                className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-4 py-2 rounded-lg font-button text-label text-on-surface-variant hover:border-primary transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                <span>{activeRange}</span>
                <span className="material-symbols-outlined text-[20px]">expand_more</span>
              </button>

              {/* Time Range Dropdown Selector */}
              {isRangeDropdownOpen && (
                <div className="absolute right-0 top-12 bg-white border border-outline-variant/30 rounded-xl shadow-xl z-[50] py-2 w-48 animate-in fade-in zoom-in-95">
                  {Object.keys(METRICS_DATA_SET).map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setActiveRange(range);
                        setIsRangeDropdownOpen(false);
                        showToast(`Range updated to ${range}`);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-surface-container text-xs font-semibold text-on-surface"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => showToast('No notifications')}
                className="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
              >
                notifications
              </button>
              <button
                onClick={() => showToast('Redirecting to settings page...')}
                className="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
              >
                settings
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="p-margin_desktop max-w-container_max mx-auto space-y-stack_lg">
          
          {/* 1. Key Metrics Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Total Revenue */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary-fixed rounded-lg text-primary flex">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="flex items-center text-tertiary font-label text-label">
                  <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                  {currentStats.revenueGrowth}
                </span>
              </div>
              <p className="font-label text-label text-secondary mb-1">Total Revenue</p>
              <h3 className="font-h2 text-h2 text-on-surface group-hover:text-primary transition-colors font-bold">
                {currentStats.revenue}
              </h3>
            </div>

            {/* Average Order Value */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-secondary-fixed rounded-lg text-secondary flex">
                  <span className="material-symbols-outlined">shopping_basket</span>
                </div>
                <span className="flex items-center text-tertiary font-label text-label">
                  <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                  {currentStats.aovGrowth}
                </span>
              </div>
              <p className="font-label text-label text-secondary mb-1">Average Order Value</p>
              <h3 className="font-h2 text-h2 text-on-surface group-hover:text-primary transition-colors font-bold">
                {currentStats.aov}
              </h3>
            </div>

            {/* Growth Rate */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-tertiary-fixed rounded-lg text-tertiary flex">
                  <span className="material-symbols-outlined">insights</span>
                </div>
                <span className="flex items-center text-tertiary font-label text-label">
                  <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                  {currentStats.growthGrowth}
                </span>
              </div>
              <p className="font-label text-label text-secondary mb-1">Growth Rate</p>
              <h3 className="font-h2 text-h2 text-on-surface group-hover:text-primary transition-colors font-bold">
                {currentStats.growth}
              </h3>
            </div>

            {/* Active Orders */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-error-container rounded-lg text-error flex">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <span className="flex items-center text-error font-label text-label">
                  <span className="material-symbols-outlined text-[16px] mr-1">trending_down</span>
                  {currentStats.ordersGrowth}
                </span>
              </div>
              <p className="font-label text-label text-secondary mb-1">Active Orders</p>
              <h3 className="font-h2 text-h2 text-on-surface group-hover:text-primary transition-colors font-bold">
                {currentStats.orders}
              </h3>
            </div>
          </section>

          {/* 2. Revenue over Time & Distribution (Bento Layout) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            
            {/* Large Revenue Chart */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface mb-1 font-bold">Revenue over Time</h4>
                  <p className="font-small text-small text-secondary">
                    Weekly performance monitoring for last {currentStats.weeks.length} intervals
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                    <span className="font-label text-label">Current</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></span>
                    <span className="font-label text-label">Previous</span>
                  </div>
                </div>
              </div>

              {/* Chart simulation layout */}
              <div className="flex-1 w-full h-64 relative overflow-hidden rounded-xl bg-surface-container-low flex items-end px-4 py-8">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(#ff5a1f 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                ></div>
                <div className="flex items-end justify-between w-full h-full gap-4 relative z-10">
                  <svg className="absolute bottom-16 left-0 w-full h-32 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path
                      className="transition-all duration-700 ease-in-out"
                      d={currentStats.linePath}
                      fill="none"
                      stroke="#ff5a1f"
                      strokeWidth="2"
                    ></path>
                    <path
                      className="transition-all duration-700 ease-in-out"
                      d={currentStats.prevLinePath}
                      fill="none"
                      stroke="#bdc7d9"
                      strokeDasharray="4 2"
                      strokeWidth="1.5"
                    ></path>
                  </svg>
                  <div className="h-full border-l border-outline-variant flex flex-col justify-between text-[10px] text-secondary absolute left-0 top-0 pl-2">
                    <span>$250k</span>
                    <span>$150k</span>
                    <span>$50k</span>
                    <span>0</span>
                  </div>
                  {currentStats.weeks.map((wk) => (
                    <div key={wk} className="flex-1 text-center font-label text-label text-secondary">
                      {wk}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Distribution Doughnut */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant flex flex-col">
              <h4 className="font-h3 text-h3 text-on-surface mb-1 font-bold">Order Distribution</h4>
              <p className="font-small text-small text-secondary mb-8">Cuisine popularity trends</p>
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="relative w-48 h-48 mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#00a84c" strokeDasharray="70 30" strokeDashoffset="0" stroke-width="4"></circle>
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#ff5a1f" stroke-dasharray="25 75" stroke-dashoffset="-70" stroke-width="4"></circle>
                    <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#555f6f" stroke-dasharray="5 95" stroke-dashoffset="-95" stroke-width="4"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-h3 text-h3 text-on-surface font-bold">100%</span>
                    <span className="font-label text-label text-secondary uppercase">Total</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                      <span className="font-body text-body">Italian</span>
                    </div>
                    <span className="font-button text-button">70%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                      <span className="font-body text-body">Vegan</span>
                    </div>
                    <span className="font-button text-button">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="font-body text-body">Asian</span>
                    </div>
                    <span className="font-button text-button">5%</span>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* 3. Top Restaurants & Hotspots */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            
            {/* Top Performing Restaurants */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-h3 text-h3 text-on-surface font-bold">Top Performing Restaurants</h4>
                <button
                  onClick={() => showToast('Top restaurants metrics expanded')}
                  className="text-primary font-button text-label hover:underline cursor-pointer bg-transparent border-none"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left font-label text-label text-secondary border-b border-outline-variant pb-4">
                      <th className="pb-4 font-semibold">Restaurant</th>
                      <th className="pb-4 font-semibold text-right">Revenue</th>
                      <th className="pb-4 font-semibold text-right">Goal Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    <tr>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">local_pizza</span>
                          </div>
                          <span className="font-body text-body font-semibold">Pasta Palace</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-body text-body font-bold">$124,000</td>
                      <td className="py-4 w-48 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-tertiary-container w-[92%]"></div>
                          </div>
                          <span className="font-label text-label">92%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">eco</span>
                          </div>
                          <span className="font-body text-body font-semibold">The Green Bowl</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-body text-body font-bold">$98,500</td>
                      <td className="py-4 w-48 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-primary-container w-[78%]"></div>
                          </div>
                          <span className="font-label text-label">78%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">ramen_dining</span>
                          </div>
                          <span className="font-body text-body font-semibold">Sushi Zen</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-body text-body font-bold">$82,400</td>
                      <td className="py-4 w-48 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-primary-container w-[65%]"></div>
                          </div>
                          <span className="font-label text-label">65%</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">bakery_dining</span>
                          </div>
                          <span className="font-body text-body font-semibold">Morning Brews</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-body text-body font-bold">$45,200</td>
                      <td className="py-4 w-48 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-secondary w-[45%]"></div>
                          </div>
                          <span className="font-label text-label">45%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery Hotspots Map */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface font-bold">Delivery Hotspots</h4>
                  <p className="font-small text-small text-secondary">Geographical density of active orders</p>
                </div>
                <span
                  onClick={() => showToast('Filters applied to hotspots density map')}
                  className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer"
                >
                  filter_list
                </span>
              </div>
              <div className="flex-1 relative rounded-xl overflow-hidden bg-surface-container min-h-[300px]">
                <div
                  className="absolute inset-0 grayscale opacity-40 mix-blend-multiply"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAz0heYyd7ZHT4CEvLvi6GKDBE3PXCwkqVKCeQpFG7cQDgAxF1wLHP7C8IaoDh319E9FFlPbaK9mfCZJl5N2RNnQ78JLAXzzPJJenkPIGx561xtK17frMgW0cUMzwBAOyiQLjlSgIQ4ED0c7IDST9htVs9BNkU-XLRKPvcfVB7rbIsFX1O92jW4uk8bWy2zkJL7TqejwRXP9y7gNJSclrkQRzbEtjlVtbxCeisMGJb0yPANgGGLfjVvOA')",
                  }}
                ></div>

                {/* Pulse Hotspots Pins */}
                {HOTSPOTS.map((pin) => (
                  <button
                    key={pin.id}
                    onClick={() => {
                      setSelectedHotspot(pin);
                      showToast(`Switched view to ${pin.district}`);
                    }}
                    className="absolute w-12 h-12 flex items-center justify-center cursor-pointer border-none bg-transparent focus:outline-none transition-transform hover:scale-110"
                    style={{ top: pin.top, left: pin.left }}
                  >
                    <span className="absolute w-full h-full bg-primary-container opacity-30 rounded-full animate-ping"></span>
                    <span className="relative w-4 h-4 bg-primary-container rounded-full border-2 border-white shadow-md"></span>
                  </button>
                ))}

                {/* Hotspot details overlay */}
                {selectedHotspot && (
                  <div className="absolute bottom-4 left-4 p-4 glass-card rounded-lg border border-outline-variant shadow-lg max-w-[220px] animate-in fade-in">
                    <p className="font-label text-label text-on-surface font-bold mb-1">
                      {selectedHotspot.district}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                        <span className="text-[10px] text-secondary font-bold">
                          Efficiency: {selectedHotspot.efficiency}
                        </span>
                      </div>
                      <p className="text-[10px] text-secondary font-semibold pl-4">
                        Orders Today: {selectedHotspot.activeOrders}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </section>

          {/* 4. Quick-stat Mini Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Sustainability Card */}
            <div
              onClick={() => showToast('Opening Sustainability metrics portfolio')}
              className="bg-surface-container-low p-8 rounded-xl border border-tertiary-container/20 flex items-center gap-6 group hover:bg-tertiary-container/5 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 bg-tertiary-container text-white rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform flex-shrink-0">
                <span className="material-symbols-outlined text-[32px]">eco</span>
              </div>
              <div>
                <h5 className="font-label text-label text-tertiary mb-1 uppercase tracking-wider font-bold">
                  Sustainability Index
                </h5>
                <p className="font-h3 text-h3 text-on-surface mb-1 font-bold">84/100</p>
                <p className="font-small text-small text-secondary">
                  92% eco-friendly packaging used across 240 partners.
                </p>
              </div>
            </div>

            {/* Retention Card */}
            <div
              onClick={() => showToast('Opening loyalty program retention stats')}
              className="bg-surface-container-low p-8 rounded-xl border border-primary-container/20 flex items-center gap-6 group hover:bg-primary-container/5 transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 bg-primary-container text-white rounded-2xl flex items-center justify-center transform group-hover:-rotate-6 transition-transform flex-shrink-0">
                <span className="material-symbols-outlined text-[32px]">group</span>
              </div>
              <div>
                <h5 className="font-label text-label text-primary mb-1 uppercase tracking-wider font-bold">
                  User Retention
                </h5>
                <p className="font-h3 text-h3 text-on-surface mb-1 font-bold">68.2%</p>
                <p className="font-small text-small text-secondary">
                  Repeat orders increased by 4.2% since loyalty program launch.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Anchor */}
        <footer className="w-full py-stack_lg px-margin_desktop bg-inverse-surface dark:bg-surface-container-lowest mt-stack_lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container_max mx-auto">
            <div className="col-span-1">
              <h3 className="font-h3 text-h3 text-primary-fixed mb-4 font-bold text-primary-fixed">Foodora</h3>
              <p className="text-surface-variant/80 font-small text-small leading-relaxed">
                The ultimate management suite for the future of gourmet delivery. Powering thousands of kitchens
                worldwide.
              </p>
            </div>
            <div className="col-span-1">
              <h4 className="font-button text-white mb-4">Company</h4>
              <ul className="space-y-2 text-small text-surface-variant/80 font-semibold">
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    Careers
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="font-button text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-small text-surface-variant/80 font-semibold">
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    Legal Notice
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="font-button text-white mb-4">Support</h4>
              <ul className="space-y-2 text-small text-surface-variant/80 font-semibold">
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    Help Center
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    API Docs
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary-fixed hover:underline transition-all" href="#">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-container_max mx-auto border-t border-surface-variant/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-small text-small text-surface-variant/80">© 2024 Foodora. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a className="text-surface-variant/80 hover:text-primary-fixed" href="#">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a className="text-surface-variant/80 hover:text-primary-fixed" href="#">
                <span className="material-symbols-outlined">language</span>
              </a>
              <a className="text-surface-variant/80 hover:text-primary-fixed" href="#">
                <span className="material-symbols-outlined">alternate_email</span>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;
