import React, { useState, useMemo, useEffect, useRef } from 'react';
import Icon from '../../../../components/common/Icon';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../../../api/axios';
import { fetchAdminAnalytics, fetchAdminOrders, updateAdminOrderStatus } from '../../../../redux/adminSlice';
import AdminHeader from '../../../../components/adminDashboardComponents/AdminHeader';
import StatCard from '../../../../components/adminDashboardComponents/StatCard';
import OrderStatusSimulator from '../../../../components/adminDashboardComponents/OrderStatusSimulator';
import AdminLiveDeliveries from '../../../../components/adminDashboardComponents/AdminLiveDeliveries';
import { generateChartPaths } from '../../../../helper/chartUtils';
import { StatCardSkeleton, ChartSkeleton } from '../../../../components/common/Skeleton';
import { isTerminalOrder } from '../../../../constants/orderStatus';
import { USER_ROLES, APP_ROUTES } from '../../../../constants';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { analytics, orders, analyticsLoading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAdminAnalytics());
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  // True only for the very first load, so a background refresh doesn't blank
  // out a dashboard the user is already reading.
  const isInitialLoad = analyticsLoading && !analytics;

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
  const toastTimerRef = useRef(null);

  // Handle toast trigger. The timer is tracked so a rapid second toast doesn't
  // get cleared early by the first one's pending timeout, and so nothing fires
  // after unmount.
  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // Find the most recent active order to simulate
  const activeOrderRaw = orders.find((o) => !isTerminalOrder(o.status)) || orders[0];
  
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

      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[70] bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Icon name="info" className="text-primary-fixed" />
          <span className="font-button text-button text-sm">{toastMessage}</span>
        </div>
      )}

      {/* (Restaurant Addition Modal Removed, user is routed to /admin/onboarding instead) */}

      {/* Main Content Canvas. `max-w` without `mx-auto` left the whole
          dashboard hard against the left edge on wide screens. */}
      <main className="p-margin_mobile md:p-margin_desktop max-w-container_max mx-auto">
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
          {isInitialLoad ? (
            // Real skeletons instead of the previous "..." / "Loading..."
            // placeholders, which made finished cards jump as the text resized.
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
          <>
          <StatCard
            icon="shopping_bag"
            colorClass="bg-primary/5"
            iconColorClass="text-primary"
            trendText={analytics?.trends?.orders}
            trendUp={analytics?.trends?.orders?.includes('+')}
            title="Total Orders"
            // Optional chaining throughout: a partial analytics payload (any
            // missing sub-object) previously threw and blanked the dashboard.
            value={(analytics?.orders?.total ?? 0).toLocaleString()}
          />
          <StatCard
            icon="payments"
            colorClass="bg-tertiary/5"
            iconColorClass="text-tertiary"
            trendText={analytics?.trends?.revenue}
            trendUp={analytics?.trends?.revenue?.includes('+')}
            title="Total Revenue"
            value={`$${(analytics?.orders?.revenue ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
          <StatCard
            icon="group"
            colorClass="bg-on-secondary-fixed-variant/5"
            iconColorClass="text-secondary"
            trendText={analytics?.trends?.customers}
            trendUp={analytics?.trends?.customers?.includes('+')}
            title="Active Customers"
            value={(analytics?.users?.totalCustomers ?? 0).toLocaleString()}
          />
          <StatCard
            icon="restaurant"
            colorClass="bg-outline/5"
            iconColorClass="text-on-surface-variant"
            trendText={analytics?.trends?.restaurants}
            trendUp={undefined}
            title="Active Restaurants"
            value={(analytics?.restaurants?.active ?? 0).toLocaleString()}
          />
          </>
          )}
        </section>

        {/* Main Chart Section */}
        <section className="mb-stack_lg">
          {isInitialLoad ? <ChartSkeleton height={360} /> : (
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
                    strokeLinejoin="round"
                    strokeWidth="4"
                    // preserveAspectRatio="none" scales x and y by different
                    // factors, which was stretching the stroke into an uneven
                    // ribbon. This keeps it a constant 4px everywhere.
                    vectorEffect="non-scaling-stroke"
                  ></path>
                  {dynamicChart.points.map((pt, idx) => (
                    <circle
                      key={idx}
                      onMouseEnter={() => setHoveredPoint({
                         ...pt,
                         index: idx,
                         value: `$${pt.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      // `hover:r-[10px]` was here — Tailwind has no utility for
                      // the SVG `r` attribute, so the hover grow never happened.
                      // Driving r from state actually works.
                      className="cursor-pointer"
                      style={{ transition: 'r 150ms var(--ease-out-soft)' }}
                      cx={pt.cx}
                      cy={pt.cy}
                      fill="#ae3200"
                      r={hoveredPoint?.index === idx ? 9 : 6}
                    ></circle>
                  ))}
                </svg>

                {hoveredPoint && (
                  <div
                    className="absolute bg-inverse-surface text-inverse-on-surface px-3 py-2 rounded-lg shadow-xl -translate-x-1/2 -translate-y-full flex flex-col z-20 pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${(hoveredPoint.cx / 1000) * 100}%`,
                      // `cy` is in viewBox units (0–300), not pixels. Using it
                      // directly as px placed the tooltip well away from its
                      // point on a 360px-tall chart; a percentage tracks the
                      // stretched SVG correctly at any height.
                      top: `calc(${(hoveredPoint.cy / 300) * 100}% - 10px)`,
                    }}
                  >
                    <span className="font-label text-[12px] text-inverse-on-surface/70">
                      {hoveredPoint.date}
                    </span>
                    <span className="font-button text-button text-inverse-on-surface">
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
          )}
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
                    <Icon name="download" className="text-primary" />
                    <span className="font-button text-button text-on-surface">
                      Download Sales Report
                    </span>
                  </div>
                  <Icon name="chevron_right" className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <Link
                  to="/admin/offers"
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group w-full text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="campaign" className="text-primary" />
                    <span className="font-button text-button text-on-surface">
                      Create New Promotion
                    </span>
                  </div>
                  <Icon name="chevron_right" className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                  to="/admin/products"
                  className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group w-full text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="restaurant_menu" className="text-primary" />
                    <span className="font-button text-button text-on-surface">
                      Add New Menu Item
                    </span>
                  </div>
                  <Icon name="chevron_right" className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>

            {/* Top Performing */}

              <div className="bg-surface-container-lowest p-gutter rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <h3 className="font-h3 text-h3 text-on-surface mb-stack_md font-bold">
                  Top Selling Item
                </h3>
                {analytics?.topItems?.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-variant flex-shrink-0 flex items-center justify-center">
                        <Icon name="local_pizza" className="text-primary text-3xl" />
                      </div>
                      <div>
                        <h4 className="font-button text-button text-on-surface font-semibold line-clamp-1">
                          {analytics.topItems[0].name}
                        </h4>
                        <p className="font-label text-label text-secondary">
                          {analytics.topItems[0].quantity} orders
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container p-3 rounded-lg">
                        <p className="font-label text-[12px] text-secondary uppercase">
                          Revenue Generated
                        </p>
                        <p className="font-button text-button text-on-surface">${analytics.topItems[0].revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-secondary">No data yet.</p>
                )}
              </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button (FAB) - For Global Add */}
      {!user?.restaurantId && user?.role === USER_ROLES.RESTAURANT_ADMIN && (
      <button
        onClick={() => navigate(APP_ROUTES.ADMIN_ONBOARDING)}
        className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(174,50,0,0.3)] hover:scale-110 active:scale-95 transition-all z-[60] group cursor-pointer border-none"
      >
        <Icon name="add" />
        <span className="absolute right-full mr-4 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg font-label text-label opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          Create New
        </span>
      </button>
      )}

      {/* Footer */}
      <footer className="py-stack_lg px-margin_mobile md:px-margin_desktop bg-inverse-surface mt-stack_lg w-full">
        <div className="max-w-container_max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="flex flex-col gap-2">
            <span className="font-h3 text-h3 text-primary-fixed font-bold">Foodora</span>
            <p className="font-small text-small text-inverse-on-surface/60">
              Admin Management Suite v4.2.0
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-label text-label text-primary-fixed uppercase tracking-wide">
              QUICK LINKS
            </p>
            <a
              className="font-small text-small text-inverse-on-surface/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Support Center
            </a>
            <a
              className="font-small text-small text-inverse-on-surface/80 hover:text-primary-fixed hover:underline transition-all"
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
              className="font-small text-small text-inverse-on-surface/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="font-small text-small text-inverse-on-surface/80 hover:text-primary-fixed hover:underline transition-all"
              href="#"
            >
              Terms of Service
            </a>
          </div>
          <div className="flex flex-col gap-4 items-end justify-between h-full">
            <p className="font-small text-small text-inverse-on-surface/80">
              © 2024 Foodora. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Icon name="language" className="text-inverse-on-surface/80 cursor-pointer hover:text-primary-fixed" />
              <Icon name="settings" className="text-inverse-on-surface/80 cursor-pointer hover:text-primary-fixed" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboardPage;
