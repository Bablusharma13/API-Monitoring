import { useRef } from "react";

export default function FileButton({
  label = "Export",
  icon,
  baseStyles = "text-[#6B7280] bg-white border-[#E9EBF0]",
  hoverStyles = "hover:bg-[#EFF4FF] hover:border-blue-600 hover:text-blue-600",
  accept,
  multiple = false,
  disabled = false,
  onChange,
  onClick,
  className = "",
}) {
  const fileInputRef = useRef(null);

  const defaultIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const handleClick = () => {
    onClick?.();
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-2.5 py-2 text-xs border rounded-lg
          transition-colors cursor-pointer
          disabled:opacity-45 disabled:cursor-not-allowed
          ${baseStyles} ${!disabled ? hoverStyles : ""}
          ${className}
        `}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {icon ?? defaultIcon}
        {label}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={onChange}
      />
    </>
  );
}