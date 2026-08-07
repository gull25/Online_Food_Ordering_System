import React from 'react';

import Icon from '../Icon';
const ErrorMessage = ({ message, className = '' }) => {
  return (
    <div className={`p-4 bg-error-container text-on-error-container rounded-xl font-body text-small flex items-center gap-2 shadow-sm ${className}`}>
      <Icon name="error" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
