import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

/**
 * MainLayout — shared layout for all customer-facing pages.
 *
 * Renders the persistent Navbar above the page content.
 * Admin pages deliberately bypass this layout so they get no customer Navbar.
 */
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default MainLayout;
