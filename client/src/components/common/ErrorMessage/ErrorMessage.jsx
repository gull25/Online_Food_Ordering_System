import React from 'react';

const ErrorMessage = ({ message, className = '' }) => {
  return (
    <div className={`p-4 bg-error-container text-on-error-container rounded-xl font-body text-small flex items-center gap-2 shadow-sm ${className}`}>
      <span className="material-symbols-outlined">error</span>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
