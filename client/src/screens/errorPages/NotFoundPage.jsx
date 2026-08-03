import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFoundPage — displayed for any unknown route (catch-all *).
 * Styled with the project's existing design tokens — zero new styles introduced.
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-margin_desktop text-center">
      {/* Large 404 */}
      <span className="text-[120px] font-extrabold text-primary/10 leading-none select-none">
        404
      </span>

      {/* Icon */}
      <span
        className="material-symbols-outlined text-primary text-[64px] -mt-4 mb-stack_md"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        sentiment_dissatisfied
      </span>

      {/* Heading */}
      <h1 className="font-h2 text-h2 text-on-surface font-bold mb-2">
        Page Not Found
      </h1>

      {/* Subtext */}
      <p className="font-body text-body text-on-secondary-container max-w-sm mb-stack_lg">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>

      {/* CTA */}
      <Link
        to="/"
        className="px-stack_lg py-3 bg-primary text-white font-button rounded-xl shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all duration-200"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
