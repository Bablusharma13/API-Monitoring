import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const SIZE_CLASS = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
  wide: "sm:max-w-[720px]",
};

/**
 * Shared layout for Add API, Add Category, tenant forms, task modals, etc.
 * Theme-aware (light/dark) via CSS classes in index.css.
 */
export default function FormModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  headerExtra,
  size = "md",
  zIndex = 600,
  ariaLabel,
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="form-modal-overlay fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
    >
      <div
        className={`form-modal-panel w-full ${SIZE_CLASS[size] || SIZE_CLASS.md} max-h-[min(92dvh,920px)] flex flex-col overflow-hidden sm:rounded-2xl rounded-t-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="form-modal-header shrink-0 flex items-start justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b">
          <div className="min-w-0 flex-1">
            <h2 className="form-modal-title text-base sm:text-[17px] font-semibold leading-snug">
              {title}
            </h2>
            {subtitle ? (
              <p className="form-modal-subtitle text-xs sm:text-[12px] mt-1 leading-relaxed">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="form-modal-close shrink-0"
            aria-label="Close dialog"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </header>

        {headerExtra ? (
          <div className="form-modal-header-extra shrink-0 border-b">{headerExtra}</div>
        ) : null}

        <div className="form-modal-body flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5">
          {children}
        </div>

        {footer ? (
          <footer className="form-modal-footer shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 border-t flex flex-wrap items-center gap-2">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/** Right-aligned action row; use `className="mr-auto"` on first child for Back + actions layout */
export function FormModalActions({ children, className = "" }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto justify-end ${className}`}
    >
      {children}
    </div>
  );
}
