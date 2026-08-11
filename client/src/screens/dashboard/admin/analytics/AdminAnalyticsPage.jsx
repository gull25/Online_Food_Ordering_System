import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../../../../components/common/Icon';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAnalytics } from '../../../../redux/adminSlice';
import AdminHeader from '../../../../components/adminDashboardComponents/AdminHeader';
import StatCard from '../../../../components/adminDashboardComponents/StatCard';
import { generateChartPaths } from '../../../../helper/chartUtils';

// Static data removed in favor of dynamic generation

const HOTSPOTS = [
  { id: 'central', district: 'Central District', efficiency: '94%', activeOrders: 142, top: '20%', left: '30%' },
  { id: 'northside', district: 'Northside District', efficiency: '89%', activeOrders: 98, top: '60%', left: '70%' },
  { id: 'westside', district: 'Westside District', efficiency: '91%', activeOrders: 65, top: '40%', left: '50%' },
];

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { analytics } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminAnalytics());
  }, [dispatch]);

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
    if (!analytics) {
      return {
        revenue: '$0', orders: '0', growth: '0%', aov: '$0.00',
        linePath: '', prevLinePath: '', xLabels: []
      };
    }

    // Dynamic chart paths
    let data = [];
    if (analytics.timeSeriesData) {
      data = analytics.timeSeriesData.map(ts => ({ value: ts.revenue, label: ts.label }));
    }
    const chart = generateChartPaths(data, 100, 100, 10);

    const step = Math.max(1, Math.floor(data.length / 5));
    const labels = [];
    for (let i = 0; i < data.length; i += step) {
      if (labels.length < 6) labels.push(data[i].label);
    }

    // Optional chaining throughout: a payload missing any sub-object (a fresh
    // restaurant with no orders yet) previously threw here and took the whole
    // analytics page down to a blank screen.
    const totalOrders = analytics.orders?.total || 0;
    const totalRevenue = analytics.orders?.revenue || 0;

    return {
      revenue: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      orders: totalOrders.toLocaleString(),
      growth: `${(analytics.restaurants?.total || 0) * 2}%`,
      aov: `$${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}`,
      linePath: chart.linePath,
      prevLinePath: chart.linePath ? chart.linePath.replace(/cy="(\d+)"/g, 'cy="$1"') : '', // mock previous
      xLabels: labels
    };
  }, [activeRange, analytics]);

  const cuisineList = useMemo(() => {
    if (!analytics?.cuisineDistribution) return [];
    // Sort descending by count
    return [...analytics.cuisineDistribution].sort((a, b) => b.count - a.count);
  }, [analytics]);

  const topRestaurantsList = useMemo(() => {
    return analytics?.topRestaurants || [];
  }, [analytics]);

  const totalCuisines = cuisineList.reduce((sum, c) => sum + c.count, 0) || 1;

  return (
    <div className="bg-background text-on-background min-h-screen">
      {/* Styles inject support */}

      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[70] bg-inverse-surface text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Icon name="info" className="text-primary-fixed" />
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
                <Icon name="close" />
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
                  className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-button text-button hover:opacity-90 transition-colors shadow-md"
                >
                  Add Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Canvas */}
      <main className="flex-1">
        {/* Header */}
        <AdminHeader
          title="Analytics Overview"
          subtitle="Comprehensive performance metrics and geographical insights"
          showToast={showToast}
        />

        {/* Scrollable Body */}
        <div className="p-margin_desktop max-w-container_max mx-auto space-y-stack_lg">

          {/* 2. Revenue over Time & Distribution (Bento Layout) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

            {/* Large Revenue Chart */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="font-h3 text-h3 text-on-surface mb-1 font-bold">Revenue over Time</h4>
                  <p className="font-small text-small text-secondary">
                    Weekly performance monitoring for last {currentStats.xLabels.length} intervals
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
                      style={{ opacity: 0.3 }}
                    ></path>
                  </svg>
                  <div className="h-full border-l border-outline-variant flex flex-col justify-between text-[12px] text-secondary absolute left-0 top-0 pl-2">
                    <span>$250k</span>
                    <span>$150k</span>
                    <span>$50k</span>
                    <span>0</span>
                  </div>
                  {currentStats.xLabels.map((lbl, i) => (
                    <div key={i} className="flex-1 text-center font-label text-label text-secondary">
                      {lbl}
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
                    <span className="font-h3 text-h3 text-on-surface font-bold">{totalCuisines === 1 && cuisineList.length === 0 ? 0 : totalCuisines}</span>
                    <span className="font-label text-label text-secondary uppercase">Total</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {cuisineList.slice(0, 4).map((cuisine, i) => {
                    const percentage = Math.round((cuisine.count / totalCuisines) * 100);
                    const colors = ['bg-tertiary-container', 'bg-primary-container', 'bg-secondary', 'bg-surface-variant'];
                    const color = colors[i % colors.length];
                    return (
                      <div key={cuisine.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${color}`}></span>
                          <span className="font-body text-body line-clamp-1">{cuisine.name}</span>
                        </div>
                        <span className="font-button text-button">{percentage}%</span>
                      </div>
                    );
                  })}
                  {cuisineList.length === 0 && (
                    <p className="text-center text-secondary text-sm">No data available.</p>
                  )}
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
                    {topRestaurantsList.length > 0 ? topRestaurantsList.map((rest, index) => {
                      const progress = Math.min(100, Math.round((rest.revenue / (topRestaurantsList[0].revenue || 1)) * 100));
                      // Pick a color based on index
                      const color = index === 0 ? 'bg-tertiary-container' : index === 1 ? 'bg-primary-container' : 'bg-secondary';
                      return (
                        <tr key={rest._id}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary overflow-hidden">
                                {rest.image ? (
                                  <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Icon name="restaurant" className="text-[20px]" />
                                )}
                              </div>
                              <span className="font-body text-body font-semibold">{rest.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-right font-body text-body font-bold">${rest.revenue.toLocaleString()}</td>
                          <td className="py-4 w-48 pl-8">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-surface-variant rounded-full overflow-hidden">
                                <div className={`h-full ${color}`} style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="font-label text-label">{progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-secondary">
                          No restaurant revenue data available.
                        </td>
                      </tr>
                    )}
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
                <button
                  type="button"
                  onClick={() => showToast('Filters applied to hotspots density map')}
                  aria-label="Filter hotspots"
                  className="text-secondary hover:text-primary cursor-pointer"
                >
                  <Icon name="filter_list" />
                </button>
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
                        <span className="text-[12px] text-secondary font-bold">
                          Efficiency: {selectedHotspot.efficiency}
                        </span>
                      </div>
                      <p className="text-[12px] text-secondary font-semibold pl-4">
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
              <div className="w-16 h-16 bg-tertiary-container text-on-tertiary-container rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform flex-shrink-0">
                <Icon name="eco" className="text-[32px]" />
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
              <div className="w-16 h-16 bg-primary text-on-primary rounded-2xl flex items-center justify-center transform group-hover:-rotate-6 transition-transform flex-shrink-0">
                <Icon name="group" className="text-[32px]" />
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
        <footer className="w-full py-stack_lg px-margin_mobile md:px-margin_desktop bg-inverse-surface text-inverse-on-surface mt-stack_lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container_max mx-auto">
            <div className="col-span-1">
              <h3 className="font-h3 text-h3 text-primary-fixed mb-4 font-bold">Foodora</h3>
              <p className="text-inverse-on-surface/75 font-small text-small leading-relaxed">
                The ultimate management suite for the future of gourmet delivery. Powering thousands of kitchens
                worldwide.
              </p>
            </div>
            <div className="col-span-1">
              <h4 className="font-button text-inverse-on-surface mb-4">Company</h4>
              <ul className="space-y-2 text-small text-inverse-on-surface/75 font-semibold">
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
              <h4 className="font-button text-inverse-on-surface mb-4">Legal</h4>
              <ul className="space-y-2 text-small text-inverse-on-surface/75 font-semibold">
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
              <h4 className="font-button text-inverse-on-surface mb-4">Support</h4>
              <ul className="space-y-2 text-small text-inverse-on-surface/75 font-semibold">
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
            <p className="font-small text-small text-inverse-on-surface/75">© 2024 Foodora. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a className="text-inverse-on-surface/75 hover:text-primary-fixed" href="#">
                <Icon name="public" />
              </a>
              <a className="text-inverse-on-surface/75 hover:text-primary-fixed" href="#">
                <Icon name="language" />
              </a>
              <a className="text-inverse-on-surface/75 hover:text-primary-fixed" href="#">
                <Icon name="alternate_email" />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;
