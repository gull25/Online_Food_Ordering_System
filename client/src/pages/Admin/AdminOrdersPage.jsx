import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../features/admin/adminSlice';
import toast from 'react-hot-toast';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import StatCard from './components/StatCard';

const ITEMS_PER_PAGE = 5;

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { orders, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

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
    return orders.filter((order) => {
      // Filter status
      const matchesFilter =
        activeFilter === 'ALL' ||
        order.status === activeFilter;

      // Filter search
      const orderIdStr = order._id.toString();
      const customerName = order.user?.name || 'Unknown User';
      const itemsStr = order.items?.map(i => i.menuItem?.name).join(', ') || '';

      const matchesSearch =
        orderIdStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemsStr.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

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
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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
                  <h4 className="font-bold text-body text-on-surface">{selectedOrder.user?.name || 'Unknown User'}</h4>
                  <p className="text-secondary text-small">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl space-y-2 border border-outline-variant/20">
                <p className="font-label text-label text-secondary uppercase">Items List</p>
                <p className="font-body text-small text-on-surface">
                  {selectedOrder.items?.map(i => `${i.quantity}x ${i.menuItem?.name || 'Unknown Item'}`).join(', ')}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
                <div>
                  <p className="font-label text-label text-secondary uppercase">Total Amount</p>
                  <p className="font-h2 text-h3 font-bold text-primary">${(selectedOrder.totalAmount || 0).toFixed(2)}</p>
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

              <div className="flex gap-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    dispatch(updateAdminOrderStatus({ orderId: selectedOrder._id, status: newStatus }))
                      .unwrap()
                      .then((updatedOrder) => {
                        setSelectedOrder(updatedOrder);
                        toast.success(`Status updated to ${newStatus}`);
                      });
                  }}
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-white font-button text-small outline-none focus:border-primary cursor-pointer"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 h-12 rounded-xl bg-secondary text-on-secondary font-button text-button hover:opacity-90 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
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
                {loading && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-secondary font-body">
                      Loading orders...
                    </td>
                  </tr>
                )}
                {!loading && paginatedOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="px-6 py-4 font-body text-body font-bold text-on-surface">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant flex-shrink-0">
                          <img
                            className="w-full h-full object-cover"
                            alt={order.user?.name || 'User'}
                            src={order.user?.avatar || "https://ui-avatars.com/api/?name=" + (order.user?.name || 'U')}
                          />
                        </div>
                        <span className="font-body text-small font-semibold">
                          {order.user?.name || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body text-small text-secondary max-w-[200px] truncate">
                      {order.items?.map(i => i.menuItem?.name).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-body text-body font-bold">
                      ${(order.totalAmount || 0).toFixed(2)}
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
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

                {!loading && paginatedOrders.length === 0 && (
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
