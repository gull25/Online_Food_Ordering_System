import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * AdminLayout — wrapper for all /admin/* pages.
 *
 * Admin pages (AdminDashboardPage, AdminOrdersPage, etc.) each embed their own
 * AdminSidebar + AdminHeader internally, so this layout intentionally stays
 * minimal. Its main purpose is to act as a semantic boundary and a place to
 * inject future admin-wide concerns (global toasts, admin-only providers, etc.)
 * without touching individual page files.
 */
const AdminLayout = () => {
  return <Outlet />;
};

export default AdminLayout;
