import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll on navigation. Without this, moving from a scrolled listing to
 * a detail page lands the user halfway down the new page. Hash links and
 * browser back/forward (which restore their own position) are left alone.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
