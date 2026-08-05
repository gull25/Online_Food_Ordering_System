import React from 'react';
import ThemeToggle from '../common/ThemeToggle';

const AdminHeader = ({ title, subtitle, searchQuery, setSearchQuery, showToast, actions }) => {
  return (
    <header className="flex justify-between items-center mb-stack_lg">
      <div>
        <h2 className="font-h2 text-h2 text-on-surface mb-1 font-bold">{title}</h2>
        <p className="font-body text-body text-secondary">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-4">

        {actions}
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden">
          <ThemeToggle />
        </div>
        <button
          onClick={() => showToast && showToast('No new notifications')}
          className="w-12 h-12 flex items-center justify-center bg-surface-container-low border border-outline-variant/30 rounded-xl hover:bg-surface-variant transition-colors relative"
        >
          <span className="material-symbols-outlined text-secondary">notifications</span>
          <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
