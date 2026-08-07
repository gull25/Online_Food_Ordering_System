import React, { useState, useEffect, useRef } from 'react';
import Icon from '../common/Icon';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { clearCart } from '../../redux/cartSlice';
import { ADMIN_SIDEBAR_LINKS } from '../../data';
import { LOCAL_STORAGE_KEYS, APP_ROUTES } from '../../constants';

const AdminSidebar = ({ activeTab, isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close the popup on outside click or Escape. Escape was missing, so the menu
  // could only be dismissed with the mouse — inconsistent with the customer
  // navbar, which honours it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dismiss the popup on navigation so it can't linger over the new page.
  useEffect(() => {
    setIsProfileOpen(false);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
    dispatch(clearCart());
    dispatch(logout());
    navigate(APP_ROUTES.HOME);
  };

  /**
   * Nav item styling.
   *
   * The active state used to add `border-r-4` — a border that sits in the
   * layout flow, so activating a tab shrank its content box by 4px and pushed
   * the label sideways. `transition-all` then animated that shift over 200ms,
   * which is what read as the sidebar "glitching" on every navigation.
   *
   * The indicator is now absolutely positioned (out of flow) and only colours
   * transition, so nothing moves. Padding is `px-4` inside a `px-2` nav, which
   * lines the labels up with the `px-6` header instead of sitting 8px right of
   * it.
   */
  const getTabClass = (tabName) => {
    // `text-label` (12px, 0.05em tracking) is overline styling meant for badges
    // and eyebrow text. Applied to primary navigation it read far smaller than
    // the section heading above it, and the icons — which size from font-size —
    // shrank with it. `text-body` puts the labels on the app's 14→16px reading
    // scale and drops the wide tracking.
    const base =
      'relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl w-full text-left font-body text-body cursor-pointer transition-colors duration-200 active:scale-100';

    return activeTab === tabName
      ? `${base} text-primary font-semibold bg-primary/10`
      : `${base} text-on-surface-variant font-medium hover:bg-surface-variant/40 hover:text-on-surface`;
  };

  return (
    <aside
      // Off-canvas drawer below lg, static rail from lg up. `transform` is the
      // only animated property so the slide never reflows the page behind it.
      className={`fixed inset-y-0 left-0 z-50 h-screen w-64 bg-surface-container-low border-r border-outline-variant/30 flex flex-col shrink-0 transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="px-6 py-10 lg:py-10 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <h1 className="font-h3 text-h3 text-primary font-bold">Foodora Admin</h1>
          <p className="font-label text-label text-on-surface-variant uppercase tracking-wider">
            Management Suite
          </p>
        </div>
        {/* Dismiss control for the drawer; the rail doesn't need one. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="lg:hidden w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors shrink-0"
        >
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-2" aria-label="Admin navigation">
        {ADMIN_SIDEBAR_LINKS.filter(link => link.roles.length === 0 || link.roles.includes(user?.role)).map(link => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => navigate(link.path)}
              aria-current={isActive ? 'page' : undefined}
              className={getTabClass(link.id)}
            >
              {/* Out-of-flow accent bar — matches the rider sidebar's left
                  indicator so both dashboards read the same way. */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-primary"
                />
              )}
              {/* Sized explicitly so the icon stays proportionate to the label
                  rather than inheriting whatever the text scale happens to be. */}
              <Icon name={link.icon} filled={isActive} className="text-[22px]" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>
      {!user?.restaurantId && user?.role === 'restaurant_admin' && (
        <div className="p-6">
          <button
            onClick={() => navigate(APP_ROUTES.ADMIN_ONBOARDING)}
            // `hover:scale-[1.02]` grew a full-width button inside a fixed
            // 256px column, so it pushed past its container on hover. Colour
            // feedback only keeps it inside the rail.
            className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-button text-button hover:brightness-105 transition-[filter,box-shadow] flex items-center justify-center gap-2 shadow-sm"
          >
            <Icon name="add_circle" />
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
              className="text-left px-4 py-3 hover:bg-surface-variant font-body text-body font-medium text-on-surface transition-colors cursor-pointer flex items-center gap-3"
            >
              <Icon name="manage_accounts" className="text-[20px]" />
              Profile Setting
            </button>
            <div className="h-px bg-outline-variant/30 mx-3" />
            <button
              onClick={handleLogout}
              className="text-left px-4 py-3 hover:bg-surface-variant font-body text-body font-medium text-error transition-colors cursor-pointer flex items-center gap-3"
            >
              <Icon name="logout" className="text-[20px]" />
              Logout
            </button>
          </div>
        )}

        {/* Clickable profile row.
            Was a bare <div onClick>, so it couldn't be reached or activated by
            keyboard and announced nothing to assistive tech. */}
        <button
          type="button"
          onClick={() => setIsProfileOpen((prev) => !prev)}
          aria-expanded={isProfileOpen}
          aria-haspopup="menu"
          className="w-full text-left px-6 py-6 border-t border-outline-variant/30 flex items-center gap-3 cursor-pointer hover:bg-surface-variant/30 transition-colors active:scale-100"
        >
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden shrink-0">
            <img
              className="w-full h-full object-cover"
              alt="Admin avatar"
              src={user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXFzmrGv9s3Ato2f9nWAgDsrlUCxvTo6kT4KBKaJD03tN2Azoye3nT9UOMNullVClmnhc2WkAJ7rJud3tnbODMqjZqHzCNmjAj8CZQ8Ska7sMJcIx3ZiPhL7CquHAT9Ko4Qu17ZXSs7e3OmQp4mTJWMDpOWY_HV97e8RWX3K_xQHZOl25WzCBwGMI0htohMFPeOhzIiqQESZenx_Z2mP4Lw_VWuLjRy7RxtvMVQ1LOPizB219JO_zZBA'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-body font-semibold text-on-surface truncate">{user?.name || 'Admin'}</p>
            <p className="text-[12px] text-secondary font-semibold uppercase tracking-wide truncate">Restaurant Admin</p>
          </div>
          <Icon name="expand_less" className={`text-[16px] text-secondary transition-transform duration-200 shrink-0 ${isProfileOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
