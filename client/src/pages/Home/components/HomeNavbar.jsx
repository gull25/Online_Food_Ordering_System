import React from 'react';
import { Link } from 'react-router-dom';

const HomeNavbar = () => {
  return (
    <nav className="sticky top-0 w-full h-[72px] z-50 bg-surface-container-lowest shadow-sm dark:bg-inverse-surface">
      <div className="flex justify-between items-center px-margin_desktop max-w-container_max mx-auto h-full">
        <div className="flex items-center gap-stack_lg">
          <Link to="/" className="font-h3 text-h3 text-primary dark:text-primary-fixed font-bold cursor-pointer hover:opacity-90">
            Foodora
          </Link>
          <div className="hidden md:flex gap-gutter items-center">
            <Link className="text-primary dark:text-primary-fixed border-b-2 border-primary font-bold pb-1 font-body text-body" to="/">
              Home
            </Link>
            <Link className="text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary transition-colors font-body text-body" to="/restaurant/bella-cucina">
              Restaurants
            </Link>
            <a className="text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary transition-colors font-body text-body" href="#">
              Categories
            </a>
            <Link className="text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary transition-colors font-body text-body" to="/offers">
              Offers
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-stack_md">
          <button className="p-2 hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer active:scale-95 duration-200 text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined">search</span>
          </button>
          <Link to="/checkout" className="relative p-2 hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer active:scale-95 duration-200 text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute top-0 right-0 bg-primary-container text-on-primary-container text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
          </Link>
          <div className="hidden md:flex items-center gap-stack_sm ml-4">
            <Link to="/auth" className="px-stack_md py-2 text-primary font-button border border-primary rounded-xl hover:bg-primary-fixed transition-all flex items-center justify-center">
              Login
            </Link>
            <Link to="/auth" className="px-stack_md py-2 bg-primary-container text-on-primary-container font-button rounded-xl hover:opacity-90 shadow-sm flex items-center justify-center">
              Sign Up
            </Link>
          </div>
          <button className="md:hidden p-2 text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
