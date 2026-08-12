import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../../../components/common/Icon';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateAdminOrderStatus } from '../../../redux/adminSlice';
import { toast } from 'react-hot-toast';
import {
  ORDER_STATUS,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  getOrderStatusTextClass,
  isActiveOrder,
  isTerminalOrder,
} from '../../../constants/orderStatus';
import { TableRowsSkeleton } from '../../../components/common/Skeleton';
import { useDebounce } from '../../../helper/useDebounce';
import AdminHeader from '../../../components/adminDashboardComponents/AdminHeader';
import StatCard from '../../../components/adminDashboardComponents/StatCard';
import AdminDeliveryReplay from '../../../components/adminDashboardComponents/AdminDeliveryReplay';
import LiveTracker from '../../../components/homeScreen/orderComponents/LiveTracker';
import { socket, connectSocket } from '../../../helper/socket';
import api from '../../../api/axios';
import { useApiAction } from '../../../hooks/useApiAction';

const ITEMS_PER_PAGE = 8;

const AdminOrdersPage = () => {
  const dispatch = useDispatch();

  const showToast = (message) => toast.success(message);

  const { user } = useSelector((state) => state.auth);
  const { orders, ordersLoading } = useSelector((state) => state.admin);

  /**
   * Skeletons are for the first paint only.
   *
   * This page refetches on every `order:new` socket event. Rendering the
   * skeleton whenever a fetch is in flight meant the entire table blinked out
   * and back each time an order arrived — and again on every status change,
   * because mutations shared the same flag. Once rows exist, refreshes swap
   * data in place instead.
   */
  const showTableSkeleton = ordersLoading && orders.length === 0;

  // UI State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [replayingOrder, setReplayingOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  useEffect(() => {
    if (!user?._id) return;
    connectSocket(user._id);

    socket.on('order:new', ({ order }) => {
      toast.success(`🛒 New order received! #${order._id?.slice(-6).toUpperCase()}`, { duration: 6000 });
      dispatch(fetchAdminOrders()); // refresh order list
    });

    return () => {
      socket.off('order:new');
    };
  }, [user, dispatch]);

  const [riders, setRiders] = useState([]);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [selectedRiderId, setSelectedRiderId] = useState('');

  const fetchRiders = async () => {
    try {
      const res = await api.get('/admin/riders');
      setRiders(res.data.data || []);
    } catch { /* riders optional */ }
  };

  const { execute: handleAssignRider, isSubmitting: isAssigningRider } = useApiAction(async (orderId) => {
    if (!selectedRiderId) return toast.error('Select a rider first');
    try {
      await api.put(`/orders/${orderId}/rider`, { riderId: selectedRiderId });
      toast.success('Rider assigned successfully!');
      setAssigningOrderId(null);
      setSelectedRiderId('');
      dispatch(fetchAdminOrders());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign rider');
    }
  });

  const { execute: handleUpdateStatus, isSubmitting: isUpdatingStatus } = useApiAction(async (orderId, newStatus) => {
    try {
      const updatedOrder = await dispatch(updateAdminOrderStatus({ orderId, status: newStatus })).unwrap();
      setSelectedOrder(updatedOrder);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    }
  });

  // A fake rider-GPS simulator lived here (a setInterval emitting random
  // coordinates around Lahore). Nothing rendered a control for it, so it was
  // unreachable code that only served to fake live tracking — removed so the
  // map reflects real rider positions only.

  // Selected filter states
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic filter rules
  const filteredOrders = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      // Filter status
      const matchesFilter = activeFilter === 'ALL' || order.status === activeFilter;
      if (!query) return matchesFilter;

      // Filter search. Item names are read from the denormalised `name` first —
      // matching only on `menuItem.name` missed every order whose menuItem
      // wasn't populated, so searching by dish silently returned nothing.
      const orderIdStr = order._id.toString();
      const customerName = order.user?.name || 'Unknown User';
      const itemsStr =
        order.items?.map((i) => i.name || i.menuItem?.name || '').join(', ') || '';

      const matchesSearch =
        orderIdStr.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        itemsStr.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, debouncedSearchQuery]);

  // Paginated subset
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  }, [filteredOrders]);

  // Clamp the page when filtering shrinks the result set — otherwise sitting on
  // page 7 and switching to a filter with two pages showed an empty table.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageWindow = useMemo(() => {
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  /**
   * These counters previously matched Title-Case statuses ('Pending',
   * 'Delivered', 'Cancelled') that the API never emits — it uses UPPER_SNAKE.
   * Pending and Completed therefore always displayed 0, and the revenue total
   * included cancelled/rejected orders because the exclusion never matched.
   */
  const metrics = useMemo(() => {
    const pendingCount = filteredOrders.filter((o) => isActiveOrder(o.status)).length;
    const completedCount = filteredOrders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;

    const nonRevenueStatuses = [
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.REJECTED,
      ORDER_STATUS.REFUNDED,
      ORDER_STATUS.PAYMENT_FAILED,
      ORDER_STATUS.PENDING_PAYMENT,
    ];
    const revenueSum = filteredOrders
      .filter((o) => !nonRevenueStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalToday: filteredOrders.length,
      pendingCount,
      completedCount,
      revenueSum,
    };
  }, [filteredOrders]);

  return (
    <div className="bg-surface text-on-surface min-h-screen relative flex">

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-md max-h-[90vh] overflow-y-auto w-full rounded-2xl p-gutter border border-outline-variant/30 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              {/* Raw API orders have no `id` field — this printed "Order
                  Details: undefined". */}
              <h3 className="font-h3 text-h3 font-bold text-on-surface">
                Order #{selectedOrder._id.slice(-6).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-secondary"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {/* `selectedOrder` is the raw API order, which has no `avatar`
                    or `customer` field — those only exist on the mapped
                    dashboard shape, so this rendered a broken image. */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt=""
                    aria-hidden="true"
                    src={
                      selectedOrder.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedOrder.user?.name || 'User')}&background=ae3200&color=fff`
                    }
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
                  {/* Order lines store a denormalised `name`; falling back to
                      the populated menuItem covers older records. */}
                  {selectedOrder.items
                    ?.map((i) => `${i.quantity}x ${i.name || i.menuItem?.name || 'Unknown Item'}`)
                    .join(', ') || 'No items recorded'}
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
                <div>
                  <p className="font-label text-label text-secondary uppercase">Total Amount</p>
                  <p className="font-h2 text-h3 font-bold text-primary">${(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="font-label text-label text-secondary uppercase text-right mb-1">Status</p>
                  <span className={`status-badge block text-center ${getOrderStatusBadgeClass(selectedOrder.status)}`}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-surface-variant/20 rounded-xl border border-outline-variant/40">
              <h4 className="font-label text-label font-bold text-on-surface-variant uppercase mb-3 flex items-center gap-2">
                <Icon name="two_wheeler" className="text-[18px]" />
                Rider Assignment
              </h4>
              {selectedOrder.rider ? (
                <div className="flex items-center gap-3 text-sm text-on-surface">
                  <Icon name="check_circle" className="text-primary text-[18px]" />
                  <span>Rider already assigned to this order.</span>
                </div>
              ) : (
                <div className="flex gap-3 items-center flex-wrap">
                  <select
                    value={assigningOrderId === selectedOrder._id ? selectedRiderId : ''}
                    onClick={() => { setAssigningOrderId(selectedOrder._id); fetchRiders(); }}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm outline-none focus:border-primary"
                  >
                    <option value="">Select a rider...</option>
                    {riders.map(r => (
                      <option key={r._id} value={r._id}>{r.name} — {r.status}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignRider(selectedOrder._id)}
                    disabled={!selectedRiderId || isAssigningRider}
                    className="px-4 h-10 rounded-lg bg-primary text-on-primary text-sm font-button hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-1"
                  >
                    {isAssigningRider && <Icon name="sync" className="animate-spin text-sm" />}
                    Assign
                  </button>
                </div>
              )}

              {selectedOrder.status === 'OUT_FOR_DELIVERY' && selectedOrder.rider && (
                <div className="mt-4 pt-4 border-t border-outline-variant/30">
                  <h4 className="font-label text-label font-bold text-on-surface-variant uppercase mb-3 flex items-center gap-2">
                    <Icon name="location_on" className="text-[18px] text-primary animate-pulse" />
                    Live GPS Tracking
                  </h4>
                  <p className="text-xs text-secondary mb-3">Live real-time location from the Rider's device.</p>
                  <div className="h-[300px] w-full rounded-xl overflow-hidden border border-outline-variant/30 relative">
                    <LiveTracker
                      orderId={selectedOrder._id}
                      restaurantLocation={selectedOrder.restaurant?.location}
                      customerLocation={selectedOrder.deliveryAddress}
                      isRiderView={false}
                    />
                  </div>
                </div>
              )}

              {/* Was gated on 'Delivered'/'Completed' — neither is a value the
                  API produces, so the route replay was unreachable. */}
              {isTerminalOrder(selectedOrder.status) && selectedOrder.routeHistory?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-outline-variant/30">
                  <h4 className="font-label text-label font-bold text-on-surface-variant uppercase mb-3 flex items-center gap-2">
                    <Icon name="history" className="text-[18px] text-primary" />
                    Delivery History
                  </h4>
                  <button
                    onClick={() => setReplayingOrder(selectedOrder)}
                    className="w-full px-4 py-2 bg-primary text-on-primary text-sm font-button rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Icon name="play_circle" className="text-[16px]" />
                    Replay Delivery Route
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                aria-label="Update order status"
                disabled={isUpdatingStatus}
                className="flex-1 h-12 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface font-button text-small outline-none focus:border-primary cursor-pointer disabled:opacity-50"
              >
                {/* The delivery half of the pipeline was missing here, so an
                    admin could never move an order past "Ready for Pickup". */}
                {[
                  ORDER_STATUS.PLACED,
                  ORDER_STATUS.ACCEPTED,
                  ORDER_STATUS.PREPARING,
                  ORDER_STATUS.READY_FOR_PICKUP,
                  ORDER_STATUS.RIDER_ASSIGNED,
                  ORDER_STATUS.PICKED_UP,
                  ORDER_STATUS.OUT_FOR_DELIVERY,
                  ORDER_STATUS.DELIVERED,
                  ORDER_STATUS.CANCELLED,
                  ORDER_STATUS.REJECTED,
                ].map((status) => (
                  <option key={status} value={status}>
                    {getOrderStatusLabel(status)}
                  </option>
                ))}
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

      {/* Main Content Area */}
      <main className="p-margin_desktop flex-1 min-w-0">

        {/* Header Section */}
        <AdminHeader
          title="Orders Management"
          subtitle="Review and manage all incoming and historical customer orders."
          showToast={showToast}
          actions={
            <div className="flex gap-4">
              <button
                onClick={() => showToast('Orders details exported successfully!')}
                className="bg-surface border border-outline-variant px-stack_md py-3 rounded-xl flex items-center gap-2 font-button text-button text-on-surface hover:bg-surface-container-low transition-all cursor-pointer"
              >
                <Icon name="download" />
                Export Report
              </button>
              <button
                onClick={() => showToast('Orders list refreshed')}
                className="bg-primary text-on-primary px-stack_md py-3 rounded-xl font-button text-button hover:shadow-lg transition-all cursor-pointer"
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
        <section className="bg-surface p-4 rounded-2xl border border-outline-variant shadow-sm mb-gutter flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Orders' },
              { id: 'PLACED', label: 'Placed' },
              { id: 'ACCEPTED', label: 'Accepted' },
              { id: 'PREPARING', label: 'Preparing' },
              { id: 'READY_FOR_PICKUP', label: 'Ready' },
              { id: 'RIDER_ASSIGNED', label: 'Rider Assigned' },
              { id: 'PICKED_UP', label: 'Picked Up' },
              { id: 'OUT_FOR_DELIVERY', label: 'Out For Delivery' },
              { id: 'DELIVERED', label: 'Delivered' },
              { id: 'CANCELLED', label: 'Cancelled' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveFilter(btn.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full font-label text-label transition-all cursor-pointer whitespace-nowrap ${activeFilter === btn.id
                  ? 'bg-primary text-on-primary font-bold'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-variant'
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
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
        <section className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-label text-label text-on-surface-variant">ORDER ID</th>
                  <th className="px-6 py-4 font-label text-label text-on-surface-variant">CUSTOMER</th>
                  <th className="px-6 py-4 font-label text-label text-on-surface-variant">ITEMS</th>
                  <th className="px-6 py-4 font-label text-label text-on-surface-variant">AMOUNT</th>
                  <th className="px-6 py-4 font-label text-label text-on-surface-variant">STATUS</th>
                  <th className="px-6 py-4 font-label text-label text-on-surface-variant">DATE/TIME</th>
                  <th className="px-6 py-4 font-label text-label text-on-surface-variant">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {showTableSkeleton && <TableRowsSkeleton rows={6} columns={7} firstColAvatar={false} />}
                {!showTableSkeleton && paginatedOrders.map((order) => (
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
                        <span className="font-body text-small font-semibold whitespace-nowrap">
                          {order.user?.name || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body text-small text-secondary max-w-50 truncate">
                      {order.items?.map((i) => i.name || i.menuItem?.name).filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-6 py-4 font-body text-body font-bold">
                      ${(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-label text-label font-bold inline-flex items-center gap-1.5 whitespace-nowrap ${getOrderStatusTextClass(order.status)}`}
                      >
                        {isActiveOrder(order.status) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        )}
                        {getOrderStatusLabel(order.status)}
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

                {!showTableSkeleton && paginatedOrders.length === 0 && (
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
                <Icon name="chevron_left" />
              </button>

              {/* A sliding window of at most 5 pages. Rendering one button per
                  page meant a busy restaurant's pagination bar ran off-screen
                  once it had a few hundred orders. */}
              {pageWindow.map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  aria-current={currentPage === pg ? 'page' : undefined}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-button text-small cursor-pointer transition-all ${currentPage === pg
                    ? 'bg-primary text-on-primary font-bold'
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
                <Icon name="chevron_right" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {replayingOrder && (
        <AdminDeliveryReplay order={replayingOrder} onClose={() => setReplayingOrder(null)} />
      )}
    </div>
  );
};

export default AdminOrdersPage;
