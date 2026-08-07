import React from 'react';

import Icon from '../Icon';
const Loader = ({ fullPage = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm' : 'py-12'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <Icon name="sync" className="text-[48px] text-primary animate-spin" />
        <span className="font-button text-small text-secondary">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
