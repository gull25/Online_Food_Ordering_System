import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAnalytics, fetchAdminOrders, updateAdminOrderStatus } from '../../features/admin/adminSlice';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import StatCard from './components/StatCard';
import RecentOrdersTable from './components/RecentOrdersTable';

const CHART_DATA_SET = {
  '30': {
    linePath: 'M0,250 Q100,180 200,210 T400,120 T600,150 T800,80 T1000,100',
    areaPath: 'M0,250 Q100,180 200,210 T400,120 T600,150 T800,80 T1000,100 V300 H0 Z',
    points: [
      { cx: 200, cy: 210, value: '$4,289.00', date: 'Oct 07' },
      { cx: 400, cy: 120, value: '$6,832.00', date: 'Oct 14' },
      { cx: 800, cy: 80, value: '$9,210.00', date: 'Oct 24' },
    ],
  },
  '90': {
    linePath: 'M0,220 Q100,140 200,180 T400,240 T600,90 T800,130 T1000,70',
    areaPath: 'M0,220 Q100,140 200,180 T400,240 T600,90 T800,130 T1000,70 V300 H0 Z',
    points: [
      { cx: 200, cy: 180, value: '$12,430.00', date: 'Sep 2024' },
      { cx: 600, cy: 90, value: '$18,920.00', date: 'Oct 2024' },
      { cx: 800, cy: 130, value: '$15,480.00', date: 'Nov 2024' },
    ],
  },
  'year': {
    linePath: 'M0,180 Q100,230 200,130 T400,190 T600,80 T800,210 T1000,110',
    areaPath: 'M0,180 Q100,230 200,130 T400,190 T600,80 T800,210 T1000,110 V300 H0 Z',
    points: [
      { cx: 200, cy: 130, value: '$48,210.00', date: 'Q1 2024' },
      { cx: 600, cy: 80, value: '$72,940.00', date: 'Q3 2024' },
      { cx: 800, cy: 210, value: '$38,200.00', date: 'Q4 2024' },
    ],
  },
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { analytics, orders, loading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAdminAnalytics());
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // Navigation active tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Performance Chart Range
  const [chartRange, setChartRange] = useState('30');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Orders and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modal State for adding new restaurant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineType, setCuisineType] = useState('Italian');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  // Handle toast trigger
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    // Map backend orders to format expected by RecentOrdersTable
    const mappedOrders = orders.slice(0, 5).map(o => ({
      id: `#${o._id.substring(o._id.length - 6).toUpperCase()}`,
      originalId: o._id,
      customer: o.user?.name || 'Unknown User',
      avatar: o.user?.avatar || `https://ui-avatars.com/api/?name=${o.user?.name || 'U'}`,
      itemsCount: o.items?.length || 0,
      amount: o.totalAmount || 0,
      status: o.status
    }));

    if (!searchQuery.trim()) return mappedOrders;
    return mappedOrders.filter(
      (order) =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  // Update order status from action dropdown
  const handleUpdateStatus = (orderId, newStatus) => {
    dispatch(updateAdminOrderStatus({ orderId, status: newStatus }))
      .unwrap()
      .then(() => {
        setActiveDropdownId(null);
        showToast(`Order updated to ${newStatus}`);
      });
  };

  // Add Restaurant form submission
  const handleAddRestaurant = (e) => {
    e.preventDefault();
    if (restaurantName.trim()) {
      showToast(`Restaurant "${restaurantName}" successfully added!`);
      setIsModalOpen(false);
      setRestaurantName('');
    }
  };

  // Quick Action simulates
  const handleQuickAction = (actionName) => {
    if (actionName === 'report') {
      showToast('Sales Report download started...');
    } else if (actionName === 'fleet') {
      showToast('Connecting with Fleet Manager via live support...');
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased overflow-x-hidden min-h-screen">
      {/* Dynamic Style injection to guarantee pixel perfection with original mockup classes */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[70] bg-inverse-surface text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-primary-fixed">info</span>
          <span className="font-button text-button text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Restaurant Addition Modal */}
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
                <label className="font-label text-label text-secondary">Restaurant Name</label>
                <input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body text-body"
                  placeholder="e.g. Bella Cucina"
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-secondary">Cuisine Type</label>
                <select
                  value={cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest font-body text-body"
                >
                  <option value="Italian">Italian</option>
                  <option value="Burgers">Burgers</option>
                  <option value="Sushi">Sushi</option>
                  <option value="Mexican">Mexican</option>
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

      {/* Side Navigation Bar */}
      <AdminSidebar setIsModalOpen={setIsModalOpen} activeTab="dashboard" />

      {/* Main Content Canvas */}
      <main className="ml-64 p-margin_desktop max-w-container_max">
        {/* Header */}
        <AdminHeader 
          title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
          subtitle={user?.role === 'admin' ? "Here's what's happening with your restaurant today." : "Here's what's happening with Foodora today."}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showToast={showToast}
        />

        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack_lg">
          <StatCard
            icon="shopping_bag"
            colorClass="bg-primary/5"
            iconColorClass="text-primary"
            trendText={analytics ? "+12.5%" : "Loading..."}
            trendUp={true}
            title="Total Orders"
            value={analytics ? analytics.orders.total.toLocaleString() : "..."}
          />
          <StatCard
            icon="payments"
            colorClass="bg-tertiary/5"
            iconColorClass="text-tertiary"
            trendText={analytics ? "+8.2%" : "Loading..."}
            trendUp={true}
            title="Total Revenue"
            value={analytics ? `$${analytics.orders.revenue.toLocaleString()}` : "..."}
          />
          <StatCard
            icon="group"
            colorClass="bg-on-secondary-fixed-variant/5"
            iconColorClass="text-secondary"
            trendText={analytics ? "+2.1%" : "Loading..."}
            trendUp={true}
            title="Active Customers"
            value={analytics ? analytics.users.totalCustomers.toLocaleString() : "..."}
          />
          <StatCard
            icon="restaurant"
            colorClass="bg-outline/5"
            iconColorClass="text-on-surface-variant"
            trendText={analytics ? "+12 new" : "Loading..."}
            trendUp={undefined}
            title="Active Restaurants"
            value={analytics ? analytics.restaurants.active.toLocaleString() : "..."}
          />
        </section>

        {/* Main Chart Section */}
        <section className="mb-stack_lg">
          <div className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-stack_lg">
              <div>
                <h3 className="font-h3 text-h3 text-on-surface font-bold">Performance Overview</h3>
                <p className="font-small text-small text-secondary">
                  Revenue and orders for the last 30 days
                </p>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg">
                <button
                  onClick={() => setChartRange('30')}
                  className={`px-4 py-2 font-label text-label rounded-md transition-all ${
                    chartRange === '30'
                      ? 'bg-surface-container-lowest shadow-sm text-on-surface font-semibold'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setChartRange('90')}
                  className={`px-4 py-2 font-label text-label rounded-md transition-all ${
                    chartRange === '90'
                      ? 'bg-surface-container-lowest shadow-sm text-on-surface font-semibold'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  90 Days
                </button>
                <button
                  onClick={() => setChartRange('year')}
                  className={`px-4 py-2 font-label text-label rounded-md transition-all ${
                    chartRange === 'year'
                      ? 'bg-surface-container-lowest shadow-sm text-on-surface font-semibold'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  1 Year
                </button>
              </div>
            </div>

            <div className="relative h-[360px] w-full flex items-end justify-between gap-2 pt-10">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-outline-variant w-full h-px"></div>
                <div className="border-b border-outline-variant w-full h-px"></div>
                <div className="border-b border-outline-variant w-full h-px"></div>
                <div className="border-b border-outline-variant w-full h-px"></div>
                <div className="border-b border-outline-variant w-full h-px"></div>
              </div>

              <div className="w-full h-full relative">
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 1000 300"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ae3200" stopOpacity="0.2"></stop>
                      <stop offset="100%" stopColor="#ae3200" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                  <path
                    className="transition-all duration-500"
                    d={CHART_DATA_SET[chartRange].areaPath}
                    fill="url(#chartGradient)"
                  ></path>
                  <path
                    className="transition-all duration-500"
                    d={CHART_DATA_SET[chartRange].linePath}
                    fill="none"
                    stroke="#ae3200"
                    strokeLinecap="round"
                    strokeWidth="4"
                  ></path>
                  {CHART_DATA_SET[chartRange].points.map((pt, idx) => (
                    <circle
                      key={idx}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer transition-all hover:r-[10px]"
                      cx={pt.cx}
                      cy={pt.cy}
                      fill="#ae3200"
                      r="6"
                    ></circle>
                  ))}
                </svg>

                {hoveredPoint && (
                  <div
                    className="absolute bg-inverse-surface text-white px-3 py-2 rounded-lg shadow-xl -translate-x-1/2 -translate-y-full flex flex-col z-20 pointer-events-none"
                    style={{
                      left: `${hoveredPoint.cx / 10}%`,
                      top: `${hoveredPoint.cy - 10}px`,
                    }}
                  >
                    <span className="font-label text-[10px] text-surface-variant/70">
                      {hoveredPoint.date}
                    </span>
                    <span className="font-button text-button text-white">
                      {hoveredPoint.value}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-4 font-label text-label text-secondary">
              {chartRange === '30' ? (
                <>
                  <span>Oct 01</span>
                  <span>Oct 07</span>
                  <span>Oct 14</span>
                  <span>Oct 21</span>
                  <span>Oct 28</span>
                </>
              ) : chartRange === '90' ? (
                <>
                  <span>Aug 24</span>
                  <span>Sep 24</span>
                  <span>Oct 24</span>
                  <span>Nov 24</span>
                </>
              ) : (
                <>
                  <span>Q1 2024</span>
                  <span>Q2 2024</span>
                  <span>Q3 2024</span>
                  <span>Q4 2024</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Orders Table & Quick Actions Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Recent Orders List */}
          <RecentOrdersTable 
            filteredOrders={filteredOrders}
            activeDropdownId={activeDropdownId}
            setActiveDropdownId={setActiveDropdownId}
            handleUpdateStatus={handleUpdateStatus}
          />

          {/* Quick Actions & Top Restaurants */}
          <div className="flex flex-col gap-gutter">
            {/* Actions */}
            <div className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <h3 className="font-h3 text-h3 text-on-surface font-bold mb-stack_md">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleQuickAction('report')}
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group w-full cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">download</span>
                    <span className="font-button text-button text-on-surface">
                      Download Sales Report
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </button>

                <Link
                  to="/offers"
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group w-full text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                    <span className="font-button text-button text-on-surface">
                      Create New Promotion
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </Link>

                <button
                  onClick={() => handleQuickAction('fleet')}
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group w-full cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">support_agent</span>
                    <span className="font-button text-button text-on-surface">
                      Contact Fleet Manager
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            {/* Top Performing */}
            <div className="bg-inverse-surface p-gutter rounded-2xl text-on-primary shadow-xl">
              <h3 className="font-h3 text-h3 text-primary-fixed mb-stack_md font-bold">
                Top Restaurant
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt="Sushi platter"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7gJU-8rbue0Vlbkm503AErp26ySz58egKGLNlMFlIrl8mhla5my1u45sbyiw-chx_iOx4rE5LK2-0IWp23rKo-oBfmIm6s4xQxq--J4cfBy4Aj6NC8NXW_sVEIMvvxDdJEVChRswoV_019fIWZ8msurh_B5ZYRWXBB0oCBw1B8ImyIPI0Rd0KiTAT9BIh8cpRZi1vIRlyZNFydw8Bz-2oKHuiVagefrfHfi50_phbbxeyN8z_qsh5Nw"
                  />
                </div>
                <div>
                  <h4 className="font-button text-button text-white font-semibold">
                    Sakura Zen Kitchen
                  </h4>
                  <p className="font-label text-label text-surface-variant/80">
                    4.9 ★ (1.2k reviews)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="font-label text-[10px] text-surface-variant uppercase">
                    Daily Revenue
                  </p>
                  <p className="font-button text-button text-white">$2,410</p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <p className="font-label text-[10px] text-surface-variant uppercase">Growth</p>
                  <p className="font-button text-button text-tertiary-fixed font-bold">+18%</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button (FAB) - For Global Add */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(174,50,0,0.3)] hover:scale-110 active:scale-95 transition-all z-[60] group cursor-pointer border-none"
      >
        <span className="material-symbols-outlined">add</span>
        <span className="absolute right-full mr-4 bg-inverse-surface text-white px-4 py-2 rounded-lg font-label text-label opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          Create New
        </span>
      </button>

      {/* Footer */}
      <footer className="ml-64 py-stack_lg px-margin_desktop bg-inverse-surface mt-stack_lg w-[calc(100%-256px)]">
        <div className="max-w-container_max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="flex flex-col gap-2">
            <span className="font-h3 text-h3 text-primary-fixed font-bold">Foodora</span>
            <p className="font-small text-small text-surface-variant/60">
              Admin Management Suite v4.2.0
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-label text-label text-primary-fixed uppercase tracking-wide">
              QUICK LINKS
            </p>
            <a
              className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Support Center
            </a>
            <a
              className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Documentation
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-label text-label text-primary-fixed uppercase tracking-wide">
              LEGAL
            </p>
            <a
              className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-small text-small text-surface-variant/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Terms of Service
            </a>
          </div>
          <div className="flex flex-col gap-4 items-end justify-between h-full">
            <p className="font-small text-small text-surface-variant/80">
              © 2024 Foodora. All rights reserved.
            </p>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-surface-variant/80 cursor-pointer hover:text-primary-fixed">
                language
              </span>
              <span className="material-symbols-outlined text-surface-variant/80 cursor-pointer hover:text-primary-fixed">
                settings
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboardPage;
