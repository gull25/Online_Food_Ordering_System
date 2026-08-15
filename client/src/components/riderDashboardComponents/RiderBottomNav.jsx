import React from 'react';
import Icon from '../common/Icon';
import { NavLink } from 'react-router-dom';
import { RIDER_SIDEBAR_LINKS } from '../../data';

/**
 * Mobile navigation for the rider dashboard.
 */
const RiderBottomNav = () => {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center rounded-xl px-4 py-1.5 min-w-[72px] transition-colors ${
      isActive
        ? 'bg-primary-container/15 text-primary'
        : 'text-on-surface-variant hover:bg-surface-container-high'
    }`;

  return (
    <nav
      aria-label="Rider navigation"
      className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant flex justify-around items-center px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 lg:hidden shadow-lg"
    >
      {RIDER_SIDEBAR_LINKS.map((link) => (
        <NavLink key={link.id} to={link.path} className={linkClass} end>
          {({ isActive }) => (
            <>
              <Icon name={link.icon} filled={isActive} className="text-[22px]" />
              <span className="font-body text-[12px] font-semibold leading-3.5 mt-1 whitespace-nowrap">
                {link.shortLabel || link.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default RiderBottomNav;
