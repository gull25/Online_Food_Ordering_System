import React from 'react';
import { Link } from 'react-router-dom';

const TopNavBar = () => {
  return (
    <nav className="bg-surface-container-lowest sticky top-0 w-full h-[72px] z-50 shadow-sm">
      <div className="flex justify-between items-center px-margin_desktop max-w-container_max mx-auto h-full">
        {/* Brand */}
        <a className="font-h3 text-h3 text-primary font-bold hover:opacity-90 transition-all flex items-center gap-2" href="#">
          Foodora
        </a>
        {/* Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-gutter h-full">
          <Link className="text-primary border-b-2 border-primary font-bold pb-1 h-full flex items-center mt-[2px] hover:opacity-90 transition-all cursor-pointer" to="/">Home</Link>
          <Link className="text-on-secondary-container hover:text-primary transition-colors hover:opacity-90 hover:scale-[1.02] cursor-pointer" to="/restaurant/bella-cucina">Restaurants</Link>
          <a className="text-on-secondary-container hover:text-primary transition-colors hover:opacity-90 hover:scale-[1.02] cursor-pointer" href="#">Categories</a>
          <Link className="text-on-secondary-container hover:text-primary transition-colors hover:opacity-90 hover:scale-[1.02] cursor-pointer" to="/offers">Offers</Link>
          <Link className="text-on-secondary-container hover:text-primary transition-colors hover:opacity-90 hover:scale-[1.02] cursor-pointer" to="/track-order">Track Order</Link>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button aria-label="Search" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-on-surface hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined" data-icon="search">search</span>
          </button>
          <Link to="/checkout" aria-label="Cart" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-on-surface hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
          </Link>
          <button aria-label="Profile" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-on-surface hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined" data-icon="person">person</span>
          </button>
          <Link to="/auth" className="hidden md:block font-button text-button bg-primary-container text-on-primary-container px-6 py-2 rounded-xl hover:opacity-90 transition-opacity">
            Login
          </Link>
          {/* Mobile Menu Toggle */}
          <button aria-label="Menu" className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-on-surface hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
