import React, { useState, useRef, useEffect, forwardRef } from "react";

const stateStyles = {
  default: {
    wrapper: "border-gray-200 focus-within:border-blue-500",
    label: "text-gray-500",
    icon: "text-blue-500",
  },
  error: {
    wrapper: "border-red-400 bg-red-50",
    label: "text-red-500",
    icon: "text-red-500",
  },
  success: {
    wrapper: "border-green-500 bg-green-50",
    label: "text-green-600",
    icon: "text-green-600",
  },
  disabled: {
    wrapper: "border-gray-200 bg-gray-50",
    label: "text-gray-400",
    icon: "text-gray-400",
  },
};

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2">
    <polyline points="2 6 5 9 10 3" />
  </svg>
);

const CloseIcon = ({ size = 8 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="2" y1="2" x2="10" y2="10" />
    <line x1="10" y1="2" x2="2" y2="10" />
  </svg>
);

const MAX_VISIBLE_TAGS = 3;

/**
 * MultiSelect
 *
 * options: [{ value, label, icon?, dot? }]
 *   icon — any ReactElement (e.g. lucide icon). Rendered at 16×16. Takes priority over dot.
 *   dot  — hex color string fallback (e.g. "#3b82f6").
 *
 * value    — string[] of selected values (controlled)
 * onChange — (values: string[]) => void
 */
const MultiSelect = forwardRef(({
  id,
  name,
  value = [],
  onChange,
  className = "",
  disabled = false,
  required = false,
  label = "",
  error = "",
  success = "",
  icon = null,
  iconColor = "",
  options = [],
  placeholder = "Select",
  maxTags = MAX_VISIBLE_TAGS,
  showSelectAll = true,
}, ref) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const selected = new Set(value);
  const state = disabled ? "disabled" : error ? "error" : success ? "success" : "default";
  const styles = stateStyles[state];
  const allSelected = selected.size === options.length;

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    if (disabled) return;
    const next = new Set(selected);
    next.has(val) ? next.delete(val) : next.add(val);
    onChange?.(Array.from(next));
  };

  const deselect = (val, e) => {
    e.stopPropagation();
    const next = new Set(selected);
    next.delete(val);
    onChange?.(Array.from(next));
  };

  const toggleAll = () => {
    if (allSelected) onChange?.([]);
    else onChange?.(options.map((o) => o.value));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange?.([]);
  };

  const selectedOptions = options.filter((o) => selected.has(o.value));
  const visibleTags = selectedOptions.slice(0, maxTags);
  const overflowCount = selectedOptions.length - maxTags;

  const focusRingClass =
    state === "error"
      ? "focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.15)] border-red-400"
      : state === "success"
      ? "focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15)] border-green-500"
      : open
      ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
      : "border-gray-200 hover:border-gray-300";

  // Renders icon (ReactElement) or dot (hex) — icon takes priority
  const OptionIndicator = ({ opt }) => {
    if (opt.icon) {
      return (
        <span
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 14, height: 14 }}
        >
          {React.isValidElement(opt.icon)
            ? React.cloneElement(opt.icon, { width: 16, height: 16, size: 16 })
            : opt.icon}
        </span>
      );
    }
    if (opt.dot) {
      return (
        <span
          className="w-[9px] h-[9px] rounded-full flex-shrink-0"
          style={{ background: opt.dot }}
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full" ref={containerRef}>
      {/* Trigger */}
      <div
        className={`relative border rounded-lg px-3 pt-2 pb-2 transition-all duration-150 cursor-pointer
          ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
          ${focusRingClass} ${className}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            !disabled && setOpen((v) => !v);
          }
        }}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        ref={ref}
      >
        {/* Floating label */}
        {label && (
          <span
            className={`absolute -top-[9px] left-2.5 px-1 flex items-center gap-1
              text-[11px] leading-none bg-white ${styles.label}`}
          >
            {icon && (
              <span className={iconColor || styles.icon}>
                {React.cloneElement(icon, { size: 11 })}
              </span>
            )}
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 pr-6 min-h-[24px]">
          {selectedOptions.length === 0 && (
            <span className="text-[13px] text-gray-400">{placeholder}</span>
          )}

          {visibleTags.map((opt) => (
            <span
              key={opt.value}
              className="flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[12px] text-blue-700 whitespace-nowrap"
            >
              {(opt.icon || opt.dot) && (
                <span className="flex items-center opacity-75">
                  <OptionIndicator opt={opt} />
                </span>
              )}
              {opt.label}
              <button
                type="button"
                onClick={(e) => deselect(opt.value, e)}
                className="flex items-center text-blue-600 transition-colors ml-0.5"
                tabIndex={-1}
              >
                <CloseIcon size={8} />
              </button>
            </span>
          ))}

          {overflowCount > 0 && (
            <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500">
              +{overflowCount}
            </span>
          )}
        </div>

        {/* Chevron */}
        <div
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg
            className={`w-4 h-4 ${styles.icon}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="mt-1 border border-gray-200 rounded-xl bg-white overflow-hidden z-50"
          role="listbox"
          aria-multiselectable="true"
        >
          {/* Select all */}
          {showSelectAll && (
            <>
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={toggleAll}
                role="option"
                aria-selected={allSelected}
              >
                <div
                  className={`w-[17px] h-[17px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all
                    ${allSelected ? "bg-blue-600 border-blue-600 border" : "border border-gray-300 bg-white"}`}
                >
                  {allSelected && <CheckIcon />}
                </div>
                <span className="text-[13px] text-gray-400">Select all</span>
              </div>
              <div className="border-t border-gray-100" />
            </>
          )}

          {/* Options */}
          {options.map((opt) => {
            const isSelected = selected.has(opt.value);
            return (
              <div
                key={opt.value}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors
                  ${isSelected ? "bg-blue-50 hover:bg-blue-50" : "hover:bg-gray-50"}`}
                onClick={() => toggle(opt.value)}
                role="option"
                aria-selected={isSelected}
              >
                <div
                  className={`w-[17px] h-[17px] rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected ? "bg-blue-600 border-blue-600 border" : "border border-gray-300 bg-white"}`}
                >
                  {isSelected && <CheckIcon />}
                </div>

                <OptionIndicator opt={opt} />

                <span className="text-[12.5px] text-gray-600">{opt.label}</span>
              </div>
            );
          })}

          {/* Footer */}
          <div className="border-t border-gray-100 flex items-center justify-between px-3.5 py-2">
            <span className="text-[12px] text-gray-400">{selected.size} selected</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-[12px] text-blue-600 hover:underline bg-none border-none cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error / success messages */}
      {error && <p className="mt-1 text-[11.5px] text-red-500 pl-0.5">{error}</p>}
      {success && !error && (
        <p className="mt-1 text-[11.5px] text-green-500 pl-0.5">{success} ✓</p>
      )}
    </div>
  );
});

MultiSelect.displayName = "MultiSelect";
export default MultiSelect;