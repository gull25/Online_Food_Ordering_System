import React from 'react';

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
        {setSearchQuery && (
          <div className="relative w-80 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body text-body focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Search orders, customers..."
              type="text"
            />
          </div>
        )}
        {actions}
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
