import React from 'react';

import Icon from './Icon';
const Toast = ({ message, type = 'success', onClose }) => {
  const bgColors = {
    success: 'bg-tertiary text-on-tertiary',
    error: 'bg-error text-on-error',
    info: 'bg-secondary text-on-secondary',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${bgColors[type]}`}>
      <Icon name={type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'} />
      <span className="font-button text-small">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss notification" className="hover:opacity-80 ml-2">
          <Icon name="close" className="text-sm" />
        </button>
      )}
    </div>
  );
};

export default Toast;
