import React from 'react';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-secondary-container">
        search
      </span>
      <input
        className="w-full h-12 pl-12 pr-4 rounded-12 border border-surface-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none font-body text-body transition-shadow shadow-sm"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
