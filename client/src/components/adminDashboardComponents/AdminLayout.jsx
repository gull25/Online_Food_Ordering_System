import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

/**
 * AdminLayout — wrapper for all /admin/* pages.
 */
const AdminLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  
  let activeTab = 'dashboard';
  if (path.includes('orders')) activeTab = 'orders';
  else if (path.includes('my-restaurant')) activeTab = 'my-restaurant';
  else if (path.includes('categories')) activeTab = 'categories';
  else if (path.includes('offers')) activeTab = 'offers';
  else if (path.includes('products')) activeTab = 'products';
  else if (path.includes('analytics')) activeTab = 'analytics';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar activeTab={activeTab} />
      <div className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
