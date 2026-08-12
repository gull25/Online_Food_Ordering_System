import React, { useCallback, useEffect, useId, useRef } from 'react';
import Icon from '../common/Icon';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * An accessible dialog.
 *
 * The previous version rendered a styled div and nothing else: no role, no
 * label, no focus management, no Escape handler and no scroll lock. In practice
 * that meant a keyboard user's focus stayed on the page behind the overlay —
 * they could tab straight into the form underneath a dialog they could not see
 * out of — a screen reader announced nothing at all when it opened, and the
 * background scrolled under the backdrop on mobile.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
  closeOnBackdrop = true,
}) => {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') return;

      // Focus trap: Tab from the last control wraps to the first rather than
      // escaping into the page behind the overlay.
      const focusable = panelRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current = document.activeElement;

    // Move focus into the dialog so the next Tab lands inside it.
    const focusable = panelRef.current?.querySelector(FOCUSABLE);
    (focusable ?? panelRef.current)?.focus();

    // Lock the background. Compensating for the scrollbar width keeps the page
    // from shifting sideways as it disappears.
    const { body } = document;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      // Return focus to whatever opened the dialog, so the keyboard user is not
      // dumped back at the top of the document.
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-margin_mobile animate-in fade-in duration-200"
      onMouseDown={(event) => {
        // `mousedown` on the backdrop specifically: a `click` handler also fires
        // when a drag that began inside the panel finishes outside it, which
        // closed the dialog while the user was selecting text.
        if (closeOnBackdrop && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`bg-surface-container-lowest w-full ${widths[size] ?? widths.lg} rounded-t-3xl sm:rounded-2xl border border-outline-variant shadow-2xl outline-none flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-250`}
      >
        {(title || onClose) && (
          <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-outline-variant/60">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="font-h3 text-h3 font-bold text-on-surface truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-1 font-body text-small text-secondary">
                  {description}
                </p>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                // Icon-only controls need an accessible name; this one had none,
                // so it was announced simply as "button".
                aria-label="Close dialog"
                className="shrink-0 w-10 h-10 -mr-2 -mt-1 rounded-full text-on-surface-variant flex items-center justify-center transition-colors hover:bg-surface-container-high hover:text-on-surface"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            )}
          </header>
        )}

        {/* Scrolls independently so a long body never pushes the header or the
            action buttons off screen. */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="px-6 py-4 border-t border-outline-variant/60 bg-surface-container-low/40 rounded-b-3xl sm:rounded-b-2xl">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Modal;
