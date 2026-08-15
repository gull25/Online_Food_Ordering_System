import React from 'react';
import ConditionalRoutes from './ConditionalRoutes';
import { Toaster } from 'react-hot-toast';
import { useAppInitialization } from './hooks/useAppInitialization';

function App() {
  useAppInitialization();

  return (
    <>
      {/*
        Targets the `#main-content` landmark that the screens render. Placed
        first in the DOM so it is the very first thing focus reaches.
      */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          className: 'font-body text-small',
          style: {
            background: 'var(--color-surface-container-lowest)',
            color: 'var(--color-on-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
            padding: '12px 16px',
            maxWidth: '420px',
          },
          success: { iconTheme: { primary: 'var(--color-tertiary)', secondary: '#fff' } },
          error: { iconTheme: { primary: 'var(--color-error)', secondary: '#fff' } },
        }}
      />
      <ConditionalRoutes />
    </>
  );
}

export default App;
