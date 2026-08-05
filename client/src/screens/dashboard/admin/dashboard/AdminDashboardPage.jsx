import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../../../api/axios';
import { fetchAdminAnalytics, fetchAdminOrders, updateAdminOrderStatus } from '../../../../redux/adminSlice';
import AdminHeader from '../../../../components/adminDashboardComponents/AdminHeader';
import StatCard from '../../../../components/adminDashboardComponents/StatCard';
import OrderStatusSimulator from '../../../../components/adminDashboardComponents/OrderStatusSimulator';
import AdminLiveDeliveries from '../../../../components/adminDashboardComponents/AdminLiveDeliveries';
import { generateChartPaths } from '../../../../helper/chartUtils';

// We use dynamic charting instead of static now
const CHART_DATA_SET = {};

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

  const [chartRange, setChartRange] = useState('30');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Dynamic Chart Generation
  const dynamicChart = useMemo(() => {
    if (!analytics?.timeSeriesData) {
      return { linePath: '', areaPath: '', points: [], xLabels: [] };
    }
    
    // Convert timeSeriesData for the selected range
    let data = [];
    if (chartRange === '30') {
      data = analytics.timeSeriesData.map(ts => ({ value: ts.revenue, label: ts.label }));
    } else {
      // Mock for 90 or year if we don't have that data in backend
      // We just stretch the 30 days data for now.
      data = analytics.timeSeriesData.map(ts => ({ value: ts.revenue, label: ts.label }));
    }

    const chart = generateChartPaths(data, 1000, 300, 40);
    
    // Pick 5 even indices for x-axis labels
    const step = Math.max(1, Math.floor(data.length / 4));
    const labels = [];
    for(let i=0; i<data.length; i+=step) {
      if(labels.length < 5) labels.push(data[i].label);
    }
    if (labels.length < 5 && data.length > 0) labels.push(data[data.length-1].label);

    return {
      ...chart,
      xLabels: labels
    };
  }, [analytics, chartRange]);

  // Orders and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // (Mock modal state removed, using /admin/onboarding route instead)

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  // Handle toast trigger
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Find the most recent active order to simulate
  const activeOrderRaw = orders.find(o => !['DELIVERED', 'CANCELLED', 'REJECTED', 'REFUNDED'].includes(o.status)) || orders[0];
  
  const activeOrder = activeOrderRaw ? {
    id: `#${activeOrderRaw._id.substring(activeOrderRaw._id.length - 6).toUpperCase()}`,
    originalId: activeOrderRaw._id,
    customer: activeOrderRaw.user?.name || 'Unknown User',
    avatar: activeOrderRaw.user?.avatar || `https://ui-avatars.com/api/?name=${activeOrderRaw.user?.name || 'U'}&background=ae3200&color=fff`,
    itemsCount: activeOrderRaw.items?.length || 0,
    amount: activeOrderRaw.totalAmount || 0,
    status: activeOrderRaw.status
  } : null;

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

  // Quick Action handling
  const handleQuickAction = async (actionName) => {
    if (actionName === 'report') {
      try {
        showToast('Generating Sales Report...');
        const response = await axiosInstance.get('/admin/reports/sales', {
          responseType: 'blob', // Important to handle the file download
        });
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sales_report.csv');
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast('Sales Report downloaded successfully!');
      } catch (error) {
        console.error('Error downloading report:', error);
        showToast('Failed to download sales report');
      }
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased overflow-x-hidden min-h-screen">
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

      {/* (Restaurant Addition Modal Removed, user is routed to /admin/onboarding instead) */}

      {/* Main Content Canvas */}
      <main className="p-margin_desktop max-w-container_max">
        {/* Header */}
        <AdminHeader 
          title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
          subtitle="Here's what's happening with your restaurant today."
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
            trendText={analytics?.trends ? analytics.trends.orders : "Loading..."}
            trendUp={analytics?.trends ? analytics.trends.orders.includes('+') : true}
            title="Total Orders"
            value={analytics ? analytics.orders.total.toLocaleString() : "..."}
          />
          <StatCard
            icon="payments"
            colorClass="bg-tertiary/5"
            iconColorClass="text-tertiary"
            trendText={analytics?.trends ? analytics.trends.revenue : "Loading..."}
            trendUp={analytics?.trends ? analytics.trends.revenue.includes('+') : true}
            title="Total Revenue"
            value={analytics ? `$${analytics.orders.revenue.toLocaleString()}` : "..."}
          />
          <StatCard
            icon="group"
            colorClass="bg-on-secondary-fixed-variant/5"
            iconColorClass="text-secondary"
            trendText={analytics?.trends ? analytics.trends.customers : "Loading..."}
            trendUp={analytics?.trends ? analytics.trends.customers.includes('+') : true}
            title="Active Customers"
            value={analytics ? analytics.users.totalCustomers.toLocaleString() : "..."}
          />
          <StatCard
            icon="restaurant"
            colorClass="bg-outline/5"
            iconColorClass="text-on-surface-variant"
            trendText={analytics?.trends ? analytics.trends.restaurants : "Loading..."}
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
                    d={dynamicChart.areaPath}
                    fill="url(#chartGradient)"
                  ></path>
                  <path
                    className="transition-all duration-500"
                    d={dynamicChart.linePath}
                    fill="none"
                    stroke="#ae3200"
                    strokeLinecap="round"
                    strokeWidth="4"
                  ></path>
                  {dynamicChart.points.map((pt, idx) => (
                    <circle
                      key={idx}
                      onMouseEnter={() => setHoveredPoint({
                         ...pt,
                         value: `$${pt.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      })}
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
              {dynamicChart.xLabels.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Live Deliveries Map */}
        <AdminLiveDeliveries />

        {/* Orders Table & Quick Actions Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Active Order Simulator */}
          <OrderStatusSimulator 
            activeOrder={activeOrder}
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
                  to="/admin/offers"
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

                <Link
                  to="/admin/products"
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group w-full text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">restaurant_menu</span>
                    <span className="font-button text-button text-on-surface">
                      Add New Menu Item
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                    chevron_right
                  </span>
                </Link>
              </div>
            </div>

            {/* Top Performing */}

              <div className="bg-inverse-surface p-gutter rounded-2xl text-on-primary shadow-xl">
                <h3 className="font-h3 text-h3 text-primary-fixed mb-stack_md font-bold">
                  Top Selling Item
                </h3>
                {analytics?.topItems?.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">local_pizza</span>
                      </div>
                      <div>
                        <h4 className="font-button text-button text-white font-semibold line-clamp-1">
                          {analytics.topItems[0].name}
                        </h4>
                        <p className="font-label text-label text-white/80">
                          {analytics.topItems[0].quantity} orders
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                        <p className="font-label text-[10px] text-white/60 uppercase">
                          Revenue Generated
                        </p>
                        <p className="font-button text-button text-white">${analytics.topItems[0].revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-white">No data yet.</p>
                )}
              </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button (FAB) - For Global Add */}
      {!user?.restaurantId && user?.role === 'restaurant_admin' && (
      <button
        onClick={() => navigate('/admin/onboarding')}
        className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(174,50,0,0.3)] hover:scale-110 active:scale-95 transition-all z-[60] group cursor-pointer border-none"
      >
        <span className="material-symbols-outlined">add</span>
        <span className="absolute right-full mr-4 bg-inverse-surface text-white px-4 py-2 rounded-lg font-label text-label opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          Create New
        </span>
      </button>
      )}

      {/* Footer */}
      <footer className="py-stack_lg px-margin_desktop bg-inverse-surface mt-stack_lg w-full">
        <div className="max-w-container_max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="flex flex-col gap-2">
            <span className="font-h3 text-h3 text-primary-fixed font-bold">Foodora</span>
            <p className="font-small text-small text-white/60">
              Admin Management Suite v4.2.0
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-label text-label text-primary-fixed uppercase tracking-wide">
              QUICK LINKS
            </p>
            <a
              className="font-small text-small text-white/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Support Center
            </a>
            <a
              className="font-small text-small text-white/80 hover:text-primary-fixed hover:underline transition-all"
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
              className="font-small text-small text-white/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-small text-small text-white/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Terms of Service
            </a>
          </div>
          <div className="flex flex-col gap-4 items-end justify-between h-full">
            <p className="font-small text-small text-white/80">
              © 2024 Foodora. All rights reserved.
            </p>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-white/80 cursor-pointer hover:text-primary-fixed">
                language
              </span>
              <span className="material-symbols-outlined text-white/80 cursor-pointer hover:text-primary-fixed">
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
