import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSidebar = ({ setIsModalOpen, activeTab }) => {
  const navigate = useNavigate();

  const getTabClass = (tabName) => {
    if (activeTab === tabName) {
      return 'flex items-center gap-4 px-6 py-4 transition-all duration-200 w-full text-left text-primary font-bold border-r-4 border-primary bg-surface-container-high/50 font-label text-label cursor-pointer';
    }
    return 'flex items-center gap-4 px-6 py-4 transition-all duration-200 w-full text-left text-secondary hover:bg-surface-variant/40 font-label text-label cursor-pointer';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-outline-variant/30 flex flex-col z-40">
      <div className="px-6 py-10 flex flex-col gap-2">
        <h1 className="font-h3 text-h3 text-primary font-bold">Foodora Admin</h1>
        <p className="font-label text-label text-on-secondary-container uppercase tracking-wider">
          Management Suite
        </p>
      </div>
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-2">
        <button
          onClick={() => navigate('/admin')}
          className={getTabClass('dashboard')}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className={getTabClass('orders')}
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <span>Orders</span>
        </button>
        <button
          onClick={() => navigate('/admin/restaurants')}
          className={getTabClass('restaurants')}
        >
          <span className="material-symbols-outlined">storefront</span>
          <span>Restaurants</span>
        </button>
        <button
          onClick={() => navigate('/admin/menu')}
          className={getTabClass('menu')}
        >
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span>Menu Management</span>
        </button>
        <button
          onClick={() => navigate('/admin/analytics')}
          className={getTabClass('analytics')}
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>Analytics</span>
        </button>
      </nav>
      {setIsModalOpen && (
        <div className="p-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-button text-button hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add New Restaurant
          </button>
        </div>
      )}
      <div className="px-6 py-8 border-t border-outline-variant/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
          <img
            className="w-full h-full object-cover"
            alt="Alex Mercer headshot"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXFzmrGv9s3Ato2f9nWAgDsrlUCxvTo6kT4KBKaJD03tN2Azoye3nT9UOMNullVClmnhc2WkAJ7rJud3tnbODMqjZqHzCNmjAj8CZQ8Ska7sMJcIx3ZiPhL7CquHAT9Ko4Qu17ZXSs7e3OmQp4mTJWMDpOWY_HV97e8RWX3K_xQHZOl25WzCBwGMI0htohMFPeOhzIiqQESZenx_Z2mP4Lw_VWuLjRy7RxtvMVQ1LOPizB219JO_zZBA"
          />
        </div>
        <div>
          <p className="font-label text-label text-on-surface">Alex Mitchell</p>
          <p className="text-[10px] text-secondary font-semibold uppercase">Super Admin</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
