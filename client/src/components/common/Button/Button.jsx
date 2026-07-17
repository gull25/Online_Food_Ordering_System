import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'font-button text-button rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer';
  const variants = {
    primary: 'bg-primary-container text-on-primary-container hover:opacity-90 active:scale-95',
    secondary: 'bg-surface-container-lowest text-on-surface border border-surface-variant hover:bg-surface-variant active:scale-95',
    danger: 'bg-error text-on-error hover:opacity-90 active:scale-95',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
