import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/globalComponents/Navbar';
import HomeFooter from '../components/globalComponents/HomeFooter';

/**
 * MainLayout — shared layout for all customer-facing pages.
 *
 * Renders the persistent Navbar above the page content.
 * Admin pages deliberately bypass this layout so they get no customer Navbar.
 */
const MainLayout = () => {
  return (
    <div className="bg-background text-on-background font-body min-h-screen relative flex flex-col w-full">
      <Navbar />
      <div className="flex-grow w-full flex flex-col">
        <Outlet />
      </div>
      <HomeFooter />
    </div>
  );
};

export default MainLayout;
