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

      </div>
    </header>
  );
};

export default AdminHeader;
