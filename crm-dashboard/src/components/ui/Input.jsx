import React from "react";

const stateStyles = {
  default: {
    wrapper: "border-gray-200 focus-within:border-blue-500 bg-white",
    label: "text-gray-500",
    icon: "text-blue-500",
    input: "text-gray-900 placeholder:text-gray-300",
  },
  error: {
    wrapper: "border-red-400 bg-red-50",
    label: "text-red-500",
    icon: "text-red-500",
    input: "text-red-600 placeholder:text-red-300",
  },
  success: {
    wrapper: "border-green-500 bg-green-50",
    label: "text-green-600",
    icon: "text-green-600",
    input: "text-green-700 placeholder:text-green-400",
  },
  disabled: {
    wrapper: "border-gray-200 bg-gray-50",
    label: "text-gray-400",
    icon: "text-gray-400",
    input: "text-gray-400 placeholder:text-gray-300",
  },
};
const Input = React.forwardRef(
  (
    {
      id,
      name,
      type = "text",
      placeholder = "",
      disabled = false,
      value,
      onChange,
      onBlur,
      onKeyDown,
      className = "",
      required = false,
      minValue,
      maxValue,
      label = "",
      error = "",
      success = "",
      allowNegative = false,
      icon = null,
      iconColor = "",
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

    const preventNegative = (e) => {
      if (!allowNegative && type === "number") {
        if (e.key === "-" || e.key === "Subtract") e.preventDefault();
      }
    };

    const numberKeyDownHandler = (e) => {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      if (type === "number") {
        if (allowedKeys.includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        if (!/^[0-9]$/.test(e.key)) {
          if (e.key !== "-" && e.key !== "Subtract") e.preventDefault();
        }
      }
    };

    // ✅ Clamp value between min and max on every change
    const handleChange = (e) => {
      if (type === "number" && e.target.value !== "") {
        const num = Number(e.target.value);
        const min = !allowNegative ? (minValue ?? 0) : minValue;

        if (maxValue !== undefined && num > maxValue) {
          e.target.value = maxValue;
        } else if (min !== undefined && num < min) {
          e.target.value = min;
        }
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        <div
          className={`relative border rounded-lg px-3 pt-2 pb-2 transition-all
        ${disabled ? "bg-gray-50" : "bg-white"}
        ${styles.wrapper}`}
        >
          {label && (
            <span
              className={`absolute -top-[9px] left-2.5 px-1
            flex items-center gap-1 text-[11px] leading-none
            ${styles.label}
            ${
              state === "error"
                ? "bg-red-50"
                : state === "success"
                  ? "bg-green-50"
                  : state === "disabled"
                    ? "bg-gray-50"
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

          <input
            ref={ref}
            id={id || name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            min={
              !allowNegative && type === "number" ? (minValue ?? 0) : minValue
            }
            max={maxValue}
            onKeyDown={(e) => {
              preventNegative(e);
              numberKeyDownHandler(e);
              if (onKeyDown) onKeyDown(e);
            }}
            className={`w-full border-none outline-none bg-transparent
            text-[13.5px]
            disabled:cursor-not-allowed
            ${styles.input}
            ${className}`}
          />
        </div>

        {error && (
          <p className="mt-1 text-[11.5px] text-red-500 pl-0.5">{error}</p>
        )}

        {success && !error && (
          <p className="mt-1 text-[11.5px] text-green-500 pl-0.5">
            {success} ✓
          </p>
        )}
      </div>
    );
  },
);

export default Input;
