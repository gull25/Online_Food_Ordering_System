import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('foodoraToken');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const { totalItems } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('foodoraToken');
    localStorage.removeItem('userInfo');
    setIsDropdownOpen(false);
    navigate('/');
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-primary dark:text-primary-fixed border-b-2 border-primary font-bold pb-1 font-body text-body flex items-center h-full mt-[2px] transition-all cursor-pointer"
      : "text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary transition-colors font-body text-body flex items-center h-full mt-[2px] hover:opacity-90 hover:scale-[1.02] cursor-pointer";
  };

  return (
    <nav className="sticky top-0 w-full h-[72px] z-50 bg-surface-container-lowest shadow-sm dark:bg-inverse-surface">
      <div className="flex justify-between items-center px-margin_desktop max-w-container_max mx-auto h-full">
        {/* Brand */}
        <div className="flex items-center gap-stack_lg h-full">
          <Link to="/" className="font-h3 text-h3 text-primary dark:text-primary-fixed font-bold cursor-pointer hover:opacity-90 flex items-center gap-2 h-full">
            Foodora
          </Link>
          
          {/* Navigation Links (Hidden on Mobile) */}
          <div className="hidden md:flex gap-gutter items-center h-full">
            {!isLoggedIn && <Link className={getLinkClass("/")} to="/">Home</Link>}
            <Link className={getLinkClass("/restaurant/bella-cucina")} to={location.pathname === '/' ? "/auth" : "/restaurant/bella-cucina"}>Restaurants</Link>
            <Link className={getLinkClass("/offers")} to={location.pathname === '/' ? "/auth" : "/offers"}>Offers</Link>
            <Link className={getLinkClass("/track-order")} to={location.pathname === '/' ? "/auth" : "/track-order"}>Track Order</Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-stack_md">
          {location.pathname !== '/' && (
            <button aria-label="Search" className="p-2 hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer active:scale-95 duration-200 text-on-secondary-container dark:text-secondary-fixed-dim hover:bg-surface-variant rounded-full flex items-center justify-center hidden md:flex">
              <span className="material-symbols-outlined" data-icon="search">search</span>
            </button>
          )}
          
          {location.pathname !== '/' && (
            <Link to="/checkout" aria-label="Cart" className="relative p-2 hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer active:scale-95 duration-200 text-on-secondary-container dark:text-secondary-fixed-dim hover:bg-surface-variant rounded-full flex items-center justify-center hidden md:flex">
              <span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          )}



          <div className="hidden md:flex items-center gap-stack_sm ml-2">
            {!isLoggedIn ? (
              <Link to="/auth" className="px-stack_md py-2 text-primary font-button border border-primary rounded-xl hover:bg-primary-fixed transition-all flex items-center justify-center">
                Login
              </Link>
            ) : (
              <div className="relative">
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-secondary-fixed overflow-hidden flex items-center justify-center cursor-pointer border border-outline-variant/30 hover:opacity-90 transition-opacity"
                >
                  <img src={userInfo.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg z-50 flex flex-col py-2 animate-in fade-in zoom-in-95">
                    <button className="text-left px-4 py-2 hover:bg-surface-variant font-body text-body text-on-surface transition-colors cursor-pointer">
                      Profile Setting
                    </button>
                    <button onClick={handleLogout} className="text-left px-4 py-2 hover:bg-surface-variant font-body text-body text-error transition-colors cursor-pointer">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button aria-label="Menu" className="md:hidden p-2 text-on-secondary-container dark:text-secondary-fixed-dim flex items-center justify-center">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
