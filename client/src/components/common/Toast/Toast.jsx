import React from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  const bgColors = {
    success: 'bg-tertiary text-on-tertiary',
    error: 'bg-error text-on-error',
    info: 'bg-secondary text-on-secondary',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${bgColors[type]}`}>
      <span className="material-symbols-outlined">
        {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
      </span>
      <span className="font-button text-small">{message}</span>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-80 ml-2">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </div>
  );
};

export default Toast;
