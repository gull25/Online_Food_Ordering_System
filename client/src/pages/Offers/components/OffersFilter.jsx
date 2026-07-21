import React from 'react';

const OffersFilter = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="mb-stack_lg max-w-md">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-secondary-container">
          search
        </span>
        <input
          className="w-full h-12 pl-12 pr-4 rounded-12 border border-surface-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body text-body transition-shadow shadow-sm"
          placeholder="Search deals or restaurants..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default OffersFilter;
