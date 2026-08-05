import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { clearCart } from '../../redux/cartSlice';
import { ADMIN_SIDEBAR_LINKS } from '../../data';
import { LOCAL_STORAGE_KEYS, APP_ROUTES } from '../../constants';

const AdminSidebar = ({ setIsModalOpen, activeTab }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
    dispatch(clearCart());
    dispatch(logout());
    navigate(APP_ROUTES.HOME);
  };

  const getTabClass = (tabName) => {
    if (activeTab === tabName) {
      return 'flex items-center gap-4 px-6 py-4 transition-all duration-200 w-full text-left text-primary font-bold border-r-4 border-primary bg-surface-container-high/50 font-label text-label cursor-pointer';
    }
    return 'flex items-center gap-4 px-6 py-4 transition-all duration-200 w-full text-left text-on-surface-variant hover:bg-surface-variant/40 font-label text-label cursor-pointer';
  };

  return (
    <aside className="h-screen w-64 bg-surface-container-low border-r border-outline-variant/30 flex flex-col z-40 shrink-0">
      <div className="px-6 py-10 flex flex-col gap-2">
        <h1 className="font-h3 text-h3 text-primary font-bold">Foodora Admin</h1>
        <p className="font-label text-label text-on-surface-variant uppercase tracking-wider">
          Management Suite
        </p>
      </div>
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-2">
        {ADMIN_SIDEBAR_LINKS.filter(link => link.roles.length === 0 || link.roles.includes(user?.role)).map(link => (
          <button
            key={link.id}
            onClick={() => navigate(link.path)}
            className={getTabClass(link.id)}
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span>{link.label}</span>
          </button>
        ))}
      </nav>
      {!user?.restaurantId && user?.role === 'restaurant_admin' && (
        <div className="p-6">
          <button
            onClick={() => navigate(APP_ROUTES.ADMIN_ONBOARDING)}
            className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-button text-button hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add New Restaurant
          </button>
        </div>
      )}

      {/* Profile section — click to open popup */}
      <div ref={profileRef} className="relative">
        {/* Profile popup — opens above the avatar */}
        {isProfileOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg flex flex-col py-2 animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => {
                setIsProfileOpen(false);
                navigate(APP_ROUTES.PROFILE);
              }}
              className="text-left px-4 py-3 hover:bg-surface-variant font-label text-label text-on-surface transition-colors cursor-pointer flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Profile Setting
            </button>
            <div className="h-px bg-outline-variant/30 mx-3" />
            <button
              onClick={handleLogout}
              className="text-left px-4 py-3 hover:bg-surface-variant font-label text-label text-error transition-colors cursor-pointer flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        )}

        {/* Clickable profile row */}
        <div
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className="px-6 py-8 border-t border-outline-variant/30 flex items-center gap-3 cursor-pointer hover:bg-surface-variant/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="Admin avatar"
              src={user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXFzmrGv9s3Ato2f9nWAgDsrlUCxvTo6kT4KBKaJD03tN2Azoye3nT9UOMNullVClmnhc2WkAJ7rJud3tnbODMqjZqHzCNmjAj8CZQ8Ska7sMJcIx3ZiPhL7CquHAT9Ko4Qu17ZXSs7e3OmQp4mTJWMDpOWY_HV97e8RWX3K_xQHZOl25WzCBwGMI0htohMFPeOhzIiqQESZenx_Z2mP4Lw_VWuLjRy7RxtvMVQ1LOPizB219JO_zZBA'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label text-label text-on-surface truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-secondary font-semibold uppercase">Restaurant Admin</p>
          </div>
          <span className={`material-symbols-outlined text-[16px] text-secondary transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}>
            expand_less
          </span>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
