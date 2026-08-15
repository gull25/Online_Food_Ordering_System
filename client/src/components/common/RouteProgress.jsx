import React, { useEffect, useState } from 'react';

/**
 * RouteProgress — the Suspense fallback for lazily-loaded routes.
 */
const RouteProgress = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 180);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-primary/10 animate-in fade-in"
    >
      <span className="sr-only">Loading page…</span>
      <div
        className="h-full w-full origin-left bg-gradient-to-r from-primary via-primary-container to-primary"
        style={{ animation: 'progress-indeterminate 1.1s var(--ease-in-out-soft) infinite' }}
      />
    </div>
  );
};

export default RouteProgress;
