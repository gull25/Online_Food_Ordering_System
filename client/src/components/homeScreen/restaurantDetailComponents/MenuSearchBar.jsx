import React from 'react';
import Icon from '../../common/Icon';

const MenuSearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative mb-stack_md">
      <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-secondary-container" />
      <input
        className="w-full h-12 pl-12 pr-11 rounded-12 border border-surface-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body text-body transition-shadow"
        placeholder="Search in this menu..."
        type="search"
        aria-label="Search this menu"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      )}
    </div>
  );
};

export default MenuSearchBar;
