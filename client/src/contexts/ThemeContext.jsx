import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LOCAL_STORAGE_KEYS } from '../constants';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const readInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';

  try {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const ThemeProvider = ({ children }) => {
  // The inline script in index.html has already applied this class to <html>
  // before first paint; this just keeps React's copy of the value in sync.
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // Keeps native controls, scrollbars and form autofill on the same theme.
    root.style.colorScheme = theme;

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme);
    } catch {
      // Storage unavailable — the class on <html> is still applied.
    }
  }, [theme]);

  // Follow the OS preference until the user makes an explicit choice.
  useEffect(() => {
    let hasExplicitChoice = false;
    try {
      hasExplicitChoice = Boolean(localStorage.getItem(LOCAL_STORAGE_KEYS.THEME));
    } catch {
      hasExplicitChoice = false;
    }
    if (hasExplicitChoice) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => setTheme(event.matches ? 'dark' : 'light');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
