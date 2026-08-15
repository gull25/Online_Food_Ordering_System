import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

/**
 * AdminLayout — wrapper for all /admin/* pages.
 */
const AdminLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  let activeTab = 'dashboard';
  if (path.includes('orders')) activeTab = 'orders';
  else if (path.includes('my-restaurant')) activeTab = 'my-restaurant';
  else if (path.includes('categories')) activeTab = 'categories';
  else if (path.includes('offers')) activeTab = 'offers';
  else if (path.includes('products')) activeTab = 'products';
  else if (path.includes('analytics')) activeTab = 'analytics';

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [path]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Backdrop — only below lg, where the sidebar is an overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      <AdminSidebar activeTab={activeTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile top bar — the only affordance for reaching the drawer */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-margin_mobile h-16 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant/30">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isSidebarOpen}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
          >
            <Icon name="menu" />
          </button>
          <span className="font-h3 text-h3 text-primary font-bold">Foodora Admin</span>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
