import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  onClick,
  disabled = false,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'font-button text-button rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer';
  const variants = {
    primary: 'bg-primary-container text-on-primary-container hover:opacity-90 active:scale-95',
    secondary: 'bg-surface-container-lowest text-on-surface border border-surface-variant hover:bg-surface-variant active:scale-95',
    danger: 'bg-error text-on-error hover:opacity-90 active:scale-95',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseStyle} ${variants[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          <span className="opacity-90">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
