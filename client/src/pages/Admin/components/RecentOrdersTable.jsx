import React from 'react';

const RecentOrdersTable = ({ filteredOrders, activeDropdownId, setActiveDropdownId, handleUpdateStatus }) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-gutter border-b border-outline-variant/30 flex items-center justify-between">
        <h3 className="font-h3 text-h3 text-on-surface font-bold">Recent Orders</h3>
        <button className="font-button text-button text-primary hover:text-on-primary-fixed-variant transition-colors flex items-center gap-1">
          View All <span className="material-symbols-outlined !text-sm">arrow_forward</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-6 py-4 font-label text-label text-on-secondary-container">
                ORDER ID
              </th>
              <th className="px-6 py-4 font-label text-label text-on-secondary-container">
                CUSTOMER
              </th>
              <th className="px-6 py-4 font-label text-label text-on-secondary-container">
                ITEMS
              </th>
              <th className="px-6 py-4 font-label text-label text-on-secondary-container">
                AMOUNT
              </th>
              <th className="px-6 py-4 font-label text-label text-on-secondary-container">
                STATUS
              </th>
              <th className="px-6 py-4 font-label text-label text-on-secondary-container">
                ACTION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 relative">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-surface-container-low/30 transition-colors"
              >
                <td className="px-6 py-4 font-small text-small font-semibold">
                  {order.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed overflow-hidden flex-shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        alt={order.customer}
                        src={order.avatar}
                      />
                    </div>
                    <span className="font-small text-small">{order.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-small text-small text-secondary">
                  {order.itemsCount} items
                </td>
                <td className="px-6 py-4 font-small text-small font-semibold">
                  ${order.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full font-label text-[10px] uppercase font-bold ${
                      order.status === 'DELIVERED'
                        ? 'bg-tertiary/10 text-tertiary'
                        : order.status === 'PREPARING'
                        ? 'bg-primary-container/20 text-on-primary-container'
                        : 'bg-surface-container-highest text-secondary'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 relative">
                  <button
                    onClick={() =>
                      setActiveDropdownId(
                        activeDropdownId === order.id ? null : order.id
                      )
                    }
                    aria-label="Order actions"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors text-secondary cursor-pointer"
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>

                  {/* Status Change Dropdown Menu */}
                  {activeDropdownId === order.id && (
                    <div className="absolute right-12 top-10 bg-white border border-outline-variant/30 rounded-xl shadow-xl z-30 py-1 w-36 animate-in fade-in zoom-in-95">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        className="w-full text-left px-4 py-2 hover:bg-surface-container text-xs font-semibold"
                      >
                        Set Delivered
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="w-full text-left px-4 py-2 hover:bg-surface-container text-xs font-semibold"
                      >
                        Set Preparing
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PENDING')}
                        className="w-full text-left px-4 py-2 hover:bg-surface-container text-xs font-semibold"
                      >
                        Set Pending
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="py-8 text-center bg-surface-container-lowest">
            <span className="material-symbols-outlined text-4xl text-on-secondary-container mb-2">
              search_off
            </span>
            <p className="text-secondary font-body">No matching orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrdersTable;
