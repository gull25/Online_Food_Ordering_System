import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * UnauthorizedPage — displayed when a user tries to access a route they
 * don't have permission for (e.g., a customer visiting /admin).
 *
 * Styled exclusively with existing design tokens.
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-margin_desktop text-center">
      {/* Large visual number */}
      <span className="text-[120px] font-extrabold text-error/10 leading-none select-none">
        403
      </span>

      {/* Icon */}
      <span
        className="material-symbols-outlined text-error text-[64px] -mt-4 mb-stack_md"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        lock
      </span>

      {/* Heading */}
      <h1 className="font-h2 text-h2 text-on-surface font-bold mb-2">
        Access Denied
      </h1>

      {/* Subtext */}
      <p className="font-body text-body text-on-secondary-container max-w-sm mb-stack_lg">
        You don't have permission to view this page. This area is restricted to
        administrators only.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-stack_md">
        <button
          onClick={() => navigate(-1)}
          className="px-stack_lg py-3 border border-primary text-primary font-button rounded-xl hover:bg-primary-fixed transition-all duration-200 cursor-pointer"
        >
          Go Back
        </button>
        <Link
          to="/"
          className="px-stack_lg py-3 bg-primary text-white font-button rounded-xl shadow-md hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
