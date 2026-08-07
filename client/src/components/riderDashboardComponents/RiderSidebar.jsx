import React from 'react';
import Icon from '../common/Icon';
import { Link } from 'react-router-dom';
import { RIDER_SIDEBAR_LINKS } from '../../data';

/**
 * Rider navigation rail.
 *
 * Deliberately mirrors AdminSidebar: same type scale, same icon size, same
 * out-of-flow active indicator. The two dashboards previously disagreed on all
 * three — this one used 12px bold labels and an in-flow `border-l-4`, which
 * shifted the row's content by 4px whenever a tab became active.
 */
const RiderSidebar = ({ activeTab }) => {
  const getTabClass = (isActive) => {
    const base =
      'relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl w-full font-body text-body transition-colors duration-200 active:scale-100';

    return isActive
      ? `${base} text-primary font-semibold bg-primary/10`
      : `${base} text-on-surface-variant font-medium hover:bg-surface-container-low hover:text-on-surface`;
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col bg-surface border-r border-outline-variant z-40 py-6 pt-20">
      <div className="px-6 mb-8">
        <h2 className="font-h3 text-h3 font-bold text-primary">Rider Dashboard</h2>
        <p className="font-label text-label text-on-surface-variant uppercase tracking-wider mt-1">
          Delivery Console
        </p>
      </div>

      <nav className="flex-1 flex flex-col px-2 gap-1" aria-label="Rider navigation">
        {RIDER_SIDEBAR_LINKS.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <Link
              key={link.id}
              to={link.path}
              aria-current={isActive ? 'page' : undefined}
              className={getTabClass(isActive)}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-primary"
                />
              )}
              <Icon name={link.icon} filled={isActive} className="text-[22px]" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default RiderSidebar;
