import React, { useState } from "react";

const stateStyles = {
  default: {
    wrapper:
      "border-gray-200 focus-within:border-blue-500 focus-within:ring-[3px] focus-within:ring-blue-500/15 bg-white",
    label: "text-gray-500",
    labelBg: "bg-white",
    icon: "text-blue-500",
  },
  error: {
    wrapper: "border-red-400", // ← border only, no bg
    label: "text-red-500",
    labelBg: "bg-white",
    icon: "text-red-500",
  },
  success: {
    wrapper: "border-green-500", // ← border only, no bg
    label: "text-green-600",
    labelBg: "bg-white",
    icon: "text-green-600",
  },
  disabled: {
    wrapper: "border-gray-200 bg-gray-50", // ← bg kept intentionally
    label: "text-gray-400",
    labelBg: "bg-gray-50",
    icon: "text-gray-400",
  },
};

export const TextareaField = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  state = "default",
  helperText = "",
  className = "",
  disabled = false,
  required = false,
  icon = null,
  iconColor = "",
}) => {
  const resolvedState = disabled ? "disabled" : state;
  const styles = stateStyles[resolvedState] || stateStyles.default;

  return (
    <div className={`w-full ${className}`}>
      {/* Floating border wrapper */}
      <div
        className={`relative border rounded-lg px-3 pt-2 pb-2 transition-all ${styles.wrapper}`}
      >
        {/* Floating label sits on the border line */}
        {label && (
          <span
            className={`absolute -top-[9px] left-2.5 px-1
              flex items-center gap-1 text-[11px] leading-none
              ${styles.label} ${styles.labelBg}`}
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

        {/* Textarea */}
        <textarea
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border-none outline-none bg-transparent
            text-[13px] resize-none disabled:cursor-not-allowed
            ${styles.textarea}`}
        />
      </div>

      {/* Helper text */}
      {helperText && (
        <p className={`text-[11px] mt-1 pl-0.5 ${styles.label}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};
