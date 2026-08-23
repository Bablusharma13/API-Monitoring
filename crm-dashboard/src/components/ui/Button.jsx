import React from "react";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconSize = 14,
      ...props
    },
    ref,
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
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          btn 
          btn-${variant} 
          btn-${size}
          ${isDisabled ? "btn-disabled" : ""}
       
        `}
        {...props}
      >
        {renderIcon()}
        {children}
      </button>
    );
  },
);
