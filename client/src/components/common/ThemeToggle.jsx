import React from 'react';
import Icon from './Icon';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      className="p-2 w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors hover:opacity-90 active:scale-95 duration-200 border border-transparent hover:border-outline-variant/30"
    >
      <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} className="text-[22px]" />
    </button>
  );
};

export default ThemeToggle;
