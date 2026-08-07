import React from 'react';

import Icon from '../common/Icon';
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-margin_mobile">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg p-6 shadow-xl border border-surface-variant animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          {title && <h3 className="font-h3 text-h3 font-bold text-on-surface">{title}</h3>}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center text-on-surface-variant"
          >
            <Icon name="close" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
