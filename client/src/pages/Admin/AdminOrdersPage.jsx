import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import StatCard from './components/StatCard';

const MOCK_ORDERS = [
  {
    id: '#ORD-9021',
    customer: 'Julian Rivera',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbIo21XWFMOnly3IkqcGThvSy40GvnG2dmMWiHjm5RK-rs3BJTaadqkOvvOFe1bhmoEjxAmDVWMNeRVe61OXB4mX2pgK8HPAnYvjNS691CLfJyNmGMY-YJgbmPyriybbG0I1Ep6K6p5emBdx2Ng_5Jf0_BIy2weW-46CqN2bYPmKhjszt1k1Wp3pDrq-GFPTb4LxUlBn4nq0DO0fQq0xDhWSoFi5dLzqJTZ3Cv2M_9YPx0wH3bq34geg',
    items: 'Truffle Burger, Sweet Potato Fries, Coke Zero',
    amount: 42.80,
    status: 'PREPARING',
    datetime: 'Oct 24, 12:45 PM',
  },
  {
    id: '#ORD-9022',
    customer: 'Elena Smith',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBhMQQi6JyWPwdGVtH__cyve0OtbfxqiT7zP-GgqYKjpAhtbVzDfvFwmrGAer12ZQDAEkPPZG0sMKPLTwAt0zQAz2mZxrx-lELZ0OyjCCBM9c-iY-xziKGAwrefoAQ_0FVQlXmh2meAoZV3VlLPLhOAAZr3sL55E7csvUxLcV3ZGvuaETS35ucgy8496XSbaVnC01O2X5477LW18uUCRSI-lp8q9ksgkOxp40LsYxQDng5O4uZFJmYRw',
    items: 'Quinoa Bowl, Salmon Tartare',
    amount: 35.00,
    status: 'OUT FOR DELIVERY',
    datetime: 'Oct 24, 12:30 PM',
  },
  {
    id: '#ORD-9023',
    customer: 'Robert Chen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbcNFE4UBlqEbt1nqIwX0Gh01BIOjfwlcAIMIeu3pYCtaysxsIUXCMuwSkgWhXu78eai0kRIcVw4jQ9O5NLY1P_2bod1qnoou6DF1ovi2DBZYT0kU3w4b-HS3zxPVIFGHxiDYmizBBuFlbhdpC8RUL0jqs1pCc5aMxEM6k_akH-NquTwupxH-WfYVYhE-thKQTTpqf9raxzpF9MSrY6zxR1gSTfxCwDCzEQ-4-tUllhFFXt0GfDMZ6aA',
    items: 'Sushi Platter (Large), Miso Soup x2',
    amount: 78.20,
    status: 'DELIVERED',
    datetime: 'Oct 24, 12:15 PM',
  },
  {
    id: '#ORD-9024',
    customer: 'Sophia Bell',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLnjQr1vR-wmJyKTBOR3SdKOKeFLlbMdscN3P72LFXJ1fC9PqxjufsDbXLEKa_CZGDRNTseL3Ws5sHenwPEjxPCF6BIT9VdJzOiHf0b765Lg6xgOXzgu1FajDwPtZuqB0B7_rqaRiNge-vSb0f1F7riwqKPX3ywbfifZzCBi5v-mpPR_OceTC_xfOWWY3LbfVTwtm7EE13Gte4mNLywbWN2E5fJFLhsLd7jVWCO2Ku4BuGt-DrtUEuVw',
    items: 'Pepperoni Pizza, Garlic Knots',
    amount: 22.40,
    status: 'PENDING',
    datetime: 'Oct 24, 1:02 PM',
  },
  {
    id: '#ORD-9025',
    customer: 'Nora G.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG7c3_Oav44D-10LTqBYgTknTJAagGCkwtfVrmI1LhBLmfbOVMcGqz_lngYbbdWUirpO9pBcPci1dX6nwTpexiIvtCGMG03DvO2jgqZMpX7XCV3QUBp_8bonpjayNDISrenqlckOgIkBzR-4P0pSuxJOmKe80iPBq0YWJy-qQHJZgMiQMcXcb73mwvYr_hvqkhcIuLY42whbERy6c8cXwv-a_L_rGAOhnDUA67CH1E9JHMpEflOyoInw',
    items: 'Chicken Tikka Masala, Naan, Rice',
    amount: 31.50,
    status: 'CANCELLED',
    datetime: 'Oct 24, 12:00 PM',
  },
  {
    id: '#ORD-9026',
    customer: 'Liam Carter',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByF1rl9zCgSVHW_4EeJNf0OuePeD4MmxLbS9l4pL46P4ZJUyFheFK_tBFwHTuBavlUMi8d4sxUJCs9dbuM2Kos4MbF6kSCtNXCGV9AD_9jlA2WVwrNpZvtl-FpAIMGPMaAiisrf9d1JDBSabq6r3VX-KtZARZvOatXisyvhAR6h7_t9vk063TmFA_xMyrMvaHn8qL8OcIi5Hyj2yUWxd0Tp83S16P7jpe5gMwZIdqLrNrzCehRBIzJpg',
    items: 'Vegan Taco Bowl, Guacamole & Chips',
    amount: 54.20,
    status: 'DELIVERED',
    datetime: 'Oct 23, 8:15 PM',
  },
  {
    id: '#ORD-9027',
    customer: 'Olivia Martinez',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiZqH-_kUyiSbC387bTJJHK05ipV2hpj_A_oHNBiXJ6S8zBktqa646qfE8qFjf9t7wMV5vcocdybRmSIoJPvo2QTjV0uFpOUuB7Ng_U9VGQGVNv7brcyABDPAjBWo6Ba-gAFsuxMOZ_jiRj9uIW-2yMBeHZg9FxWryyJyy1wpLdt8NinZLQPu3db_T-StfdOLy0yaxPzxT1lxmD1onflq9G07e0KBnCtgCV7KsUOWx5NjTEd5TJ0zFGA',
    items: 'Classic Cheeseburger, Onion Rings',
    amount: 29.90,
    status: 'PREPARING',
    datetime: 'Oct 24, 1:10 PM',
  },
  {
    id: '#ORD-9028',
    customer: 'William Davis',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIpJpn0ONEjnBQyYP5_jYWDDEnklzUa7FzXXmwoAETqFG2qxvoPHTN7QaRj2NfkASP9RYA0A2wPowjVlpVKN0FRQw8fOTCUkBtRMsm2z3QVzh7O-7pR1NGSDS3HPcWLYw8CnXbXac0Eho8sbQoYJv5iwcmI5lCCoEEpGItzz7nYSD36Do-6TgLUpQbtLB1gskYXk3IbQYTcECvlE68936-xYrrugxyzFOK0hzeZ0tORDBrg6DFhdYo1Q',
    items: 'Ribeye Steak, Mashed Potatoes',
    amount: 65.00,
    status: 'PENDING',
    datetime: 'Oct 24, 1:15 PM',
  },
  {
    id: '#ORD-9029',
    customer: 'Emma Wilson',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLnjQr1vR-wmJyKTBOR3SdKOKeFLlbMdscN3P72LFXJ1fC9PqxjufsDbXLEKa_CZGDRNTseL3Ws5sHenwPEjxPCF6BIT9VdJzOiHf0b765Lg6xgOXzgu1FajDwPtZuqB0B7_rqaRiNge-vSb0f1F7riwqKPX3ywbfifZzCBi5v-mpPR_OceTC_xfOWWY3LbfVTwtm7EE13Gte4mNLywbWN2E5fJFLhsLd7jVWCO2Ku4BuGt-DrtUEuVw',
    items: 'Caesar Salad, Iced Tea',
    amount: 19.50,
    status: 'DELIVERED',
    datetime: 'Oct 23, 7:30 PM',
  },
  {
    id: '#ORD-9030',
    customer: 'James Taylor',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG7c3_Oav44D-10LTqBYgTknTJAagGCkwtfVrmI1LhBLmfbOVMcGqz_lngYbbdWUirpO9pBcPci1dX6nwTpexiIvtCGMG03DvO2jgqZMpX7XCV3QUBp_8bonpjayNDISrenqlckOgIkBzR-4P0pSuxJOmKe80iPBq0YWJy-qQHJZgMiQMcXcb73mwvYr_hvqkhcIuLY42whbERy6c8cXwv-a_L_rGAOhnDUA67CH1E9JHMpEflOyoInw',
    items: 'BBQ Pork Ribs, Mac and Cheese',
    amount: 47.00,
    status: 'CANCELLED',
    datetime: 'Oct 23, 6:45 PM',
  },
];

const ITEMS_PER_PAGE = 5;

const AdminOrdersPage = () => {
  const navigate = useNavigate();

  // Selected filter states
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State for adding new restaurant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisineType, setCuisineType] = useState('Italian');

  // Selected Order Details modal overlay
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
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

  // Dynamic filter rules
  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter((order) => {
      // Filter status
      const matchesFilter =
        activeFilter === 'ALL' ||
        order.status === activeFilter;

      // Filter search
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  // Paginated subset
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  }, [filteredOrders]);

  // Dynamic calculations for Bento Grid metrics based on CURRENT filtered subset
  const metrics = useMemo(() => {
    const totalToday = filteredOrders.length;
    const pendingCount = filteredOrders.filter((o) => o.status === 'PENDING').length;
    const completedCount = filteredOrders.filter((o) => o.status === 'DELIVERED').length;
    const revenueSum = filteredOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      totalToday,
      pendingCount,
      completedCount,
      revenueSum,
    };
  }, [filteredOrders]);

  return (
    <div className="bg-surface text-on-surface min-h-screen relative flex">
      {/* Custom Styles for Material Design and Badges */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
        }
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

      {/* Order Details Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-gutter border border-outline-variant/30 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 font-bold text-on-surface">Order Details: {selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-secondary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt={selectedOrder.customer}
                    src={selectedOrder.avatar}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-body text-on-surface">{selectedOrder.customer}</h4>
                  <p className="text-secondary text-small">{selectedOrder.datetime}</p>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/20">
                <p className="font-label text-label text-secondary uppercase">Items List</p>
                <p className="font-body text-small text-on-surface">{selectedOrder.items}</p>
              </div>

              <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
                <div>
                  <p className="font-label text-label text-secondary uppercase">Total Amount</p>
                  <p className="font-h2 text-h3 font-bold text-primary">${selectedOrder.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-label text-label text-secondary uppercase text-right mb-1">Status</p>
                  <span
                    className={`status-badge block text-center ${
                      selectedOrder.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : selectedOrder.status === 'PREPARING'
                        ? 'bg-orange-100 text-orange-700'
                        : selectedOrder.status === 'OUT FOR DELIVERY'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedOrder.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full h-12 rounded-xl bg-secondary text-on-secondary font-button text-button hover:opacity-90 transition-colors shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SideNavBar Anchor */}
      <AdminSidebar setIsModalOpen={setIsModalOpen} activeTab="orders" />

      {/* Main Content Area */}
      <main className="ml-64 p-margin_desktop flex-1">
        
        {/* Header Section */}
        <AdminHeader 
          title="Orders Management"
          subtitle="Review and manage all incoming and historical customer orders."
          showToast={showToast}
          actions={
            <div className="flex gap-4">
              <button
                onClick={() => showToast('Orders details exported successfully!')}
                className="bg-white border border-outline-variant px-stack_md py-3 rounded-xl flex items-center gap-2 font-button text-button text-on-surface hover:bg-surface-container-low transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">download</span>
                Export Report
              </button>
              <button
                onClick={() => showToast('Orders list refreshed')}
                className="bg-primary-container text-white px-stack_md py-3 rounded-xl font-button text-button hover:shadow-lg transition-all cursor-pointer"
              >
                Refresh Orders
              </button>
            </div>
          }
        />

        {/* Metrics Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack_lg">
          <StatCard
            icon="receipt_long"
            colorClass="bg-surface-container-low"
            iconColorClass="text-secondary"
            trendText="+12%"
            trendUp={true}
            title="TOTAL ORDERS TODAY"
            value={metrics.totalToday}
          />
          <StatCard
            icon="schedule"
            colorClass="bg-primary/10"
            iconColorClass="text-primary"
            trendText={undefined}
            trendUp={undefined}
            title="PENDING"
            value={metrics.pendingCount}
          />
          <StatCard
            icon="check_circle"
            colorClass="bg-tertiary/10"
            iconColorClass="text-tertiary"
            trendText={undefined}
            trendUp={undefined}
            title="COMPLETED"
            value={metrics.completedCount}
          />
          <StatCard
            icon="payments"
            colorClass="bg-secondary/10"
            iconColorClass="text-secondary"
            trendText={undefined}
            trendUp={undefined}
            title="REVENUE"
            value={`$${metrics.revenueSum.toFixed(2)}`}
          />
        </section>

        {/* Filters & Search Bar */}
        <section className="bg-white p-4 rounded-2xl border border-outline-variant shadow-sm mb-gutter flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'PREPARING', label: 'Preparing' },
              { id: 'OUT FOR DELIVERY', label: 'Out for Delivery' },
              { id: 'DELIVERED', label: 'Delivered' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveFilter(btn.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full font-label text-label transition-all cursor-pointer ${
                  activeFilter === btn.id
                    ? 'bg-primary-container text-white font-bold'
                    : 'bg-surface-container-low text-secondary hover:bg-surface-variant'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary-container outline-none font-body text-small bg-transparent"
              placeholder="Search by Order ID or Customer..."
              type="text"
            />
          </div>
        </section>

        {/* Data Table Container */}
        <section className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-label text-label text-secondary">ORDER ID</th>
                  <th className="px-6 py-4 font-label text-label text-secondary">CUSTOMER</th>
                  <th className="px-6 py-4 font-label text-label text-secondary">ITEMS</th>
                  <th className="px-6 py-4 font-label text-label text-secondary">AMOUNT</th>
                  <th className="px-6 py-4 font-label text-label text-secondary">STATUS</th>
                  <th className="px-6 py-4 font-label text-label text-secondary">DATE/TIME</th>
                  <th className="px-6 py-4 font-label text-label text-secondary">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="px-6 py-4 font-body text-body font-bold text-on-surface">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant flex-shrink-0">
                          <img
                            className="w-full h-full object-cover"
                            alt={order.customer}
                            src={order.avatar}
                          />
                        </div>
                        <span className="font-body text-small font-semibold">
                          {order.customer}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body text-small text-secondary max-w-[200px] truncate">
                      {order.items}
                    </td>
                    <td className="px-6 py-4 font-body text-body font-bold">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`status-badge inline-block ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'PREPARING'
                            ? 'bg-orange-100 text-orange-700'
                            : order.status === 'OUT FOR DELIVERY'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-body text-small text-secondary">
                      {order.datetime}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary font-button text-small hover:underline cursor-pointer bg-transparent border-none outline-none"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-secondary font-body">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
            <p className="font-body text-small text-secondary">
              Showing {filteredOrders.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of{' '}
              {filteredOrders.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-variant transition-all disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-button text-small cursor-pointer transition-all ${
                    currentPage === pg
                      ? 'bg-primary-container text-white font-bold'
                      : 'border border-outline-variant text-secondary hover:bg-surface-variant'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-variant transition-all disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminOrdersPage;
