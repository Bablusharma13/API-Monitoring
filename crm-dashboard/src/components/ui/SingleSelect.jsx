import React from "react";

const stateStyles = {
  default: {
    wrapper: "border-gray-200 focus-within:border-blue-500 bg-white",
    label: "text-gray-500",
    icon: "text-blue-500",
    input: "text-gray-900",
  },
  error: {
    wrapper: "border-red-400 bg-red-50",
    label: "text-red-500",
    icon: "text-red-500",
    input: "text-red-600",
  },
  success: {
    wrapper: "border-green-500 bg-green-50",
    label: "text-green-600",
    icon: "text-green-600",
    input: "text-green-700",
  },
  disabled: {
    wrapper: "border-gray-200 bg-gray-50",
    label: "text-gray-400",
    icon: "text-gray-400",
    input: "text-gray-400",
  },
};

const Select = React.forwardRef(
  (
    {
      id,
      name,
      value,
      onChange,
      onBlur,
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
    },
    ref,
  ) => {
    const state = disabled
      ? "disabled"
      : error
        ? "error"
        : success
          ? "success"
          : "default";
    const styles = stateStyles[state];

    return (
      <div className="w-full">
        {/* Wrapper */}
        <div
          className={`relative border rounded-lg px-3 pt-2 pb-2 transition-all duration-200
    ${disabled ? "bg-gray-50" : "bg-white"}

    ${
      state === "error"
        ? "border-red-400 focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
        : state === "success"
          ? "border-green-500 focus-within:border-green-600 focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
          : "border-gray-200 focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
    }
  `}
        >
          {/* Floating Label */}
          {label && (
            <span
              className={`absolute -top-[9px] left-2.5 px-1
            flex items-center gap-1 text-[11px] leading-none
            ${styles.label}
            ${
              state === "error"
                ? "bg-white"
                : state === "success"
                  ? "bg-white"
                  : state === "disabled"
                    ? "bg-white"
                    : "bg-white"
            }`}
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

          {/* Select */}
          <select
            ref={ref}
            id={id || name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={`w-full border-none outline-none bg-transparent
            text-[13.5px]
            appearance-none cursor-pointer
            disabled:cursor-not-allowed
            ${styles.input}
            ${className}`}
          >
            {/* Placeholder option */}
            <option value="" hidden>
              {placeholder}
            </option>

            {/* Options */}
            {options.map((opt, index) => (
              <option key={index} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Dropdown Icon */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className={`w-4 h-4 ${styles.icon}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-1 text-[11.5px] text-red-500 pl-0.5">{error}</p>
        )}

        {/* Success */}
        {success && !error && (
          <p className="mt-1 text-[11.5px] text-green-500 pl-0.5">
            {success} ✓
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
