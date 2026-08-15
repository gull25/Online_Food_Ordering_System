import React, { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../common/Icon';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { clearCart } from '../../redux/cartSlice';
import api from '../../api/axios';
import ThemeToggle from '../common/ThemeToggle';
import { APP_ROUTES, USER_ROLES } from '../../constants';

/**
 * Navbar — conditionally renders links based on Redux auth state.
 *
 * Guest    : Home, Restaurants, Offers, Track Order | Login button
 * Customer : Restaurants, Offers, Track Order | Cart | Avatar (Profile, Logout)
 * Admin    : same as customer (admins reach their dashboard via /admin)
 *
 * Link routing rule:
 *   - Authenticated → always go to the real page.
 *   - Guest on homepage ('/') → gate to /auth first.
 *   - Guest elsewhere → go directly to the page.
 */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ── Auth from Redux (source of truth) ──────────────────────────────────────
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // ── Cart item count ─────────────────────────────────────────────────────────
  const { totalQuantity: totalItems } = useSelector((state) => state.cart);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResDropdownOpen, setIsResDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  const profileRef = useRef(null);
  const restaurantsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRestaurants = async () => {
      try {
        const res = await api.get('/restaurants');
        if (!cancelled) setRestaurants(res.data.data || []);
      } catch (err) {
        console.error('Failed to load restaurants', err);
      }
    };
    fetchRestaurants();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close every overlay on navigation. Without this, tapping a link in the
  // mobile drawer changed the route but left the drawer covering the new page.
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsResDropdownOpen(false);
  }, [location.pathname]);

  // Dismiss dropdowns on outside click and on Escape — previously the only way
  // to close the profile menu was to click its trigger again.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (restaurantsRef.current && !restaurantsRef.current.contains(event.target)) {
        setIsResDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsDropdownOpen(false);
      setIsResDropdownOpen(false);
      setIsMobileMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    dispatch(clearCart());
    dispatch(logout()); // clears persisted token + user info
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate(APP_ROUTES.HOME);
  }, [dispatch, navigate]);

  /**
   * Guests browsing the homepage are asked to sign in first; everywhere else
   * they can follow the link directly.
   */
  const gatedTarget = (path) =>
    isAuthenticated || location.pathname !== APP_ROUTES.HOME ? path : APP_ROUTES.AUTH;

  const gatedState = (path) =>
    gatedTarget(path) === APP_ROUTES.AUTH
      ? { message: 'Please login or create an account to continue.' }
      : undefined;

  // ── Styles ──────────────────────────────────────────────────────────────────
  const isActivePath = (path) => location.pathname === path;

  const getLinkClass = (path) =>
    isActivePath(path)
      ? 'text-primary border-b-2 border-primary font-bold pb-1 font-body text-body flex items-center h-full mt-[2px] transition-colors'
      : 'text-on-surface hover:text-primary transition-colors font-body text-body flex items-center h-full mt-[2px]';

  const mobileLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl font-body text-body transition-colors ${isActivePath(path)
      ? 'bg-primary/10 text-primary font-bold'
      : 'text-on-surface hover:bg-surface-variant/50'
    }`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <nav className="sticky top-0 w-full h-[72px] z-50 bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/40 shadow-sm">
      <div className="flex justify-between items-center px-margin_mobile md:px-margin_desktop max-w-container_max mx-auto h-full">

        {/* Brand */}
        <div className="flex items-center gap-stack_lg h-full">
          <Link
            to={APP_ROUTES.HOME}
            className="font-h3 text-h3 text-primary font-bold flex items-center gap-2 h-full hover:opacity-90"
          >
            Foodora
          </Link>

          {/* Navigation Links (Hidden on Mobile) */}
          <div className="hidden md:flex gap-gutter items-center h-full">
            {!isAuthenticated && (
              <Link className={getLinkClass(APP_ROUTES.HOME)} to={APP_ROUTES.HOME}>Home</Link>
            )}

            {/* Dynamic Restaurants Dropdown */}
            <div
              ref={restaurantsRef}
              className="relative h-full flex items-center"
              onMouseEnter={() => setIsResDropdownOpen(true)}
              onMouseLeave={() => setIsResDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsResDropdownOpen((open) => !open)}
                aria-expanded={isResDropdownOpen}
                aria-haspopup="true"
                className={`text-on-surface hover:text-primary transition-colors font-body text-body flex items-center h-full ${location.pathname.includes('/restaurant')
                    ? 'text-primary border-b-2 border-primary font-bold pb-1 mt-[2px]'
                    : 'mt-[2px]'
                  }`}
              >
                Restaurants
                <Icon name="expand_more" className={`text-[18px] ml-1 transition-transform duration-200 ${isResDropdownOpen ? 'rotate-180' : ''
                  }`} />
              </button>

              {isResDropdownOpen && (
                <div className="absolute top-[60px] -left-4 w-64 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl z-50 flex flex-col py-2 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 max-h-[400px] overflow-y-auto">
                  {restaurants.map((rest) => (
                    <Link
                      key={rest._id}
                      onClick={() => setIsResDropdownOpen(false)}
                      to={gatedTarget(APP_ROUTES.RESTAURANT_DETAIL(rest._id))}
                      state={gatedState(APP_ROUTES.RESTAURANT_DETAIL(rest._id))}
                      className="text-left px-4 py-3 hover:bg-surface-variant font-body text-body text-on-surface transition-colors flex items-center gap-3 border-b border-outline-variant/10 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant shrink-0">
                        <img
                          src={(!rest.images?.logo || rest.images.logo === 'no-photo.jpg') ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=100' : rest.images.logo}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="truncate font-semibold">{rest.name}</span>
                    </Link>
                  ))}
                  {restaurants.length === 0 && (
                    <div className="px-4 py-3 text-secondary text-small font-body">No restaurants found</div>
                  )}
                </div>
              )}
            </div>

            <Link
              className={getLinkClass(APP_ROUTES.OFFERS)}
              to={gatedTarget(APP_ROUTES.OFFERS)}
              state={gatedState(APP_ROUTES.OFFERS)}
            >
              Offers
            </Link>
            <Link
              className={getLinkClass(APP_ROUTES.TRACK_ORDER)}
              to={gatedTarget(APP_ROUTES.TRACK_ORDER)}
              state={gatedState(APP_ROUTES.TRACK_ORDER)}
            >
              Track Order
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-stack_sm md:gap-stack_md">

          {/* Cart — always reachable. It used to be hidden on the homepage,
              which stranded anyone who added items then navigated home. */}
          <Link
            to={APP_ROUTES.CHECKOUT}
            aria-label={totalItems > 0 ? `Cart, ${totalItems} items` : 'Cart'}
            className="relative p-2 w-10 h-10 text-on-surface hover:bg-surface-variant rounded-full flex items-center justify-center transition-colors"
          >
            <Icon name="shopping_cart" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-primary text-on-primary text-[12px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-95 duration-200">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {/* Auth section (desktop) */}
          <div className="hidden md:flex items-center gap-stack_sm">
            {!isAuthenticated ? (
              <Link
                to={APP_ROUTES.AUTH}
                className="px-stack_md py-2 text-primary font-button text-button border border-primary rounded-xl hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center"
              >
                Login
              </Link>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                  className="w-10 h-10 rounded-full bg-secondary-fixed overflow-hidden flex items-center justify-center border border-outline-variant/30 hover:opacity-90 transition-opacity"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-52 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xl z-50 flex flex-col py-2 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
                      <p className="font-body text-small font-bold text-on-surface truncate">{user?.name || 'Account'}</p>
                      <p className="text-[12px] text-secondary truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setIsDropdownOpen(false); navigate(APP_ROUTES.PROFILE); }}
                      className="text-left px-4 py-2.5 hover:bg-surface-variant font-body text-body text-on-surface transition-colors flex items-center gap-3"
                    >
                      <Icon name="manage_accounts" className="text-[20px]" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => { setIsDropdownOpen(false); navigate(APP_ROUTES.ORDERS); }}
                      className="text-left px-4 py-2.5 hover:bg-surface-variant font-body text-body text-on-surface transition-colors flex items-center gap-3"
                    >
                      <Icon name="receipt_long" className="text-[20px]" />
                      My Orders
                    </button>
                    {user?.role === USER_ROLES.RESTAURANT_ADMIN && (
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate(APP_ROUTES.ADMIN_DASHBOARD); }}
                        className="text-left px-4 py-2.5 hover:bg-surface-variant font-body text-body text-on-surface transition-colors flex items-center gap-3"
                      >
                        <Icon name="dashboard" className="text-[20px]" />
                        Admin Dashboard
                      </button>
                    )}
                    {user?.role === USER_ROLES.RIDER && (
                      <button
                        onClick={() => { setIsDropdownOpen(false); navigate(APP_ROUTES.RIDER_DASHBOARD); }}
                        className="text-left px-4 py-2.5 hover:bg-surface-variant font-body text-body text-on-surface transition-colors flex items-center gap-3"
                      >
                        <Icon name="two_wheeler" className="text-[20px]" />
                        Rider Dashboard
                      </button>
                    )}
                    <div className="h-px bg-outline-variant/30 my-1 mx-3" />
                    <button
                      onClick={handleLogout}
                      className="text-left px-4 py-2.5 hover:bg-error/10 font-body text-body text-error transition-colors flex items-center gap-3"
                    >
                      <Icon name="logout" className="text-[20px]" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <ThemeToggle />

          {/* Mobile Menu Toggle — this button previously had no handler at all,
              leaving mobile users with no navigation whatsoever. */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden p-2 w-10 h-10 text-on-surface hover:bg-surface-variant rounded-full flex items-center justify-center transition-colors"
          >
            <Icon name={isMobileMenuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-[72px] bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-menu"
            className="md:hidden fixed inset-x-0 top-[72px] z-50 bg-surface-container-lowest border-b border-outline-variant/40 shadow-xl max-h-[calc(100vh-72px)] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <div className="p-4 flex flex-col gap-1">
              <Link to={APP_ROUTES.HOME} className={mobileLinkClass(APP_ROUTES.HOME)}>
                <Icon name="home" className="text-[20px]" />
                Home
              </Link>
              <Link
                to={gatedTarget(APP_ROUTES.OFFERS)}
                state={gatedState(APP_ROUTES.OFFERS)}
                className={mobileLinkClass(APP_ROUTES.OFFERS)}
              >
                <Icon name="local_offer" className="text-[20px]" />
                Offers
              </Link>
              <Link
                to={gatedTarget(APP_ROUTES.TRACK_ORDER)}
                state={gatedState(APP_ROUTES.TRACK_ORDER)}
                className={mobileLinkClass(APP_ROUTES.TRACK_ORDER)}
              >
                <Icon name="local_shipping" className="text-[20px]" />
                Track Order
              </Link>
              <Link to={APP_ROUTES.CHECKOUT} className={mobileLinkClass(APP_ROUTES.CHECKOUT)}>
                <Icon name="shopping_cart" className="text-[20px]" />
                Cart
                {totalItems > 0 && (
                  <span className="ml-auto min-w-6 h-6 px-1.5 bg-primary text-on-primary text-[12px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>

              {restaurants.length > 0 && (
                <div className="mt-2 pt-3 border-t border-outline-variant/30">
                  <p className="px-4 pb-2 font-label text-label text-secondary uppercase tracking-wider">
                    Restaurants
                  </p>
                  <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                    {restaurants.map((rest) => (
                      <Link
                        key={rest._id}
                        to={gatedTarget(APP_ROUTES.RESTAURANT_DETAIL(rest._id))}
                        state={gatedState(APP_ROUTES.RESTAURANT_DETAIL(rest._id))}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-surface-variant/50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-variant shrink-0">
                          <img
                            src={(!rest.images?.logo || rest.images.logo === 'no-photo.jpg') ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=100' : rest.images.logo}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="truncate font-body text-body text-on-surface">{rest.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 pt-3 border-t border-outline-variant/30 flex flex-col gap-1">
                {!isAuthenticated ? (
                  <Link
                    to={APP_ROUTES.AUTH}
                    className="mx-1 h-12 bg-primary text-on-primary rounded-xl font-button text-button flex items-center justify-center gap-2"
                  >
                    <Icon name="login" className="text-[20px]" />
                    Login / Register
                  </Link>
                ) : (
                  <>
                    <Link to={APP_ROUTES.PROFILE} className={mobileLinkClass(APP_ROUTES.PROFILE)}>
                      <Icon name="manage_accounts" className="text-[20px]" />
                      Profile Settings
                    </Link>
                    <Link to={APP_ROUTES.ORDERS} className={mobileLinkClass(APP_ROUTES.ORDERS)}>
                      <Icon name="receipt_long" className="text-[20px]" />
                      My Orders
                    </Link>
                    {user?.role === USER_ROLES.RESTAURANT_ADMIN && (
                      <Link to={APP_ROUTES.ADMIN_DASHBOARD} className={mobileLinkClass(APP_ROUTES.ADMIN_DASHBOARD)}>
                        <Icon name="dashboard" className="text-[20px]" />
                        Admin Dashboard
                      </Link>
                    )}
                    {user?.role === USER_ROLES.RIDER && (
                      <Link to={APP_ROUTES.RIDER_DASHBOARD} className={mobileLinkClass(APP_ROUTES.RIDER_DASHBOARD)}>
                        <Icon name="two_wheeler" className="text-[20px]" />
                        Rider Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-body text-body text-error hover:bg-error/10 transition-colors text-left"
                    >
                      <Icon name="logout" className="text-[20px]" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
