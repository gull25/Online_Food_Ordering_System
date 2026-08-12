import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="font-label text-label text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full h-[52px] px-4 rounded-xl border transition-all font-body outline-none focus:ring-2 bg-surface-container-lowest ${
          error
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-outline-variant focus:border-primary focus:ring-primary/20'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-error font-medium">{error}</span>}
    </div>
  );
};

export default Input;
