import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Button Component
 *
 * Variants : primary | danger | success | warning | outline | ghost
 * Sizes    : sm | md | lg
 * Props    : loading, disabled, icon, iconSize, iconPosition, block
 *
 * All visual styles live in index.css via .btn, .btn-{variant}, .btn-{size}.
 */
const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",   // primary | danger | success | warning | outline | ghost
      size = "md",           // sm | md | lg
      loading = false,
      disabled = false,
      icon,                  // any lucide-react (or custom) icon element
      iconSize = 14,         // passed to icon's `size` prop
      iconPosition = "left", // left | right
      block = false,         // full-width
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const renderIcon = () => {
      if (loading) {
        return <Loader2 size={iconSize} className="animate-spin" />;
      }
      if (icon) {
        return React.cloneElement(icon, { size: iconSize });
      }
      return null;
    };

    const classes = [
      "btn",
      `btn-${variant}`,
      `btn-${size}`,
      isDisabled ? "btn-disabled" : "",
      block ? "btn-block" : "",
      // icon-only: no children text → square aspect via btn-icon
      !children ? "btn-icon" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} disabled={isDisabled} className={classes} {...props}>
        {iconPosition === "left" && renderIcon()}
        {children}
        {iconPosition === "right" && renderIcon()}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;