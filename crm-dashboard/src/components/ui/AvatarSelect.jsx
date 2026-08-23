import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

const stateStyles = {
  default: {
    wrapper: "border-gray-200 bg-white",
    wrapperOpen: "border-blue-500 ring-[3px] ring-blue-500/15 bg-white",
    label: "text-gray-500 bg-white",
    icon: "text-blue-500",
    input: "text-gray-900",
    placeholder: "text-gray-400",
  },
  error: {
    wrapper: "border-red-400 bg-red-50",
    wrapperOpen: "border-red-500 ring-[3px] ring-red-500/15 bg-red-50",
    label: "text-red-500 bg-red-50",
    icon: "text-red-500",
    input: "text-red-600",
    placeholder: "text-red-300",
  },
  success: {
    wrapper: "border-green-500 bg-green-50",
    wrapperOpen: "border-green-600 ring-[3px] ring-green-500/15 bg-green-50",
    label: "text-green-600 bg-green-50",
    icon: "text-green-600",
    input: "text-green-700",
    placeholder: "text-green-400",
  },
  disabled: {
    wrapper: "border-gray-200 bg-gray-50",
    wrapperOpen: "border-gray-200 bg-gray-50",
    label: "text-gray-400 bg-gray-50",
    icon: "text-gray-400",
    input: "text-gray-400",
    placeholder: "text-gray-300",
  },
};

const AVATAR_COLORS = [
  "4f46e5", "7c3aed", "059669", "16a34a",
  "d97706", "f59e0b", "dc2626", "ea580c",
  "0ea5e9", "2563eb", "9333ea", "be185d",
];

const getAvatarUrl = (name) => {
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  return `https://ui-avatars.com/api/?background=${color}&color=fff&name=${encodeURIComponent(name || "")}`;
};

export default function AvatarSelect({
  label = "",
  placeholder = "Select...",
  options = [],
  value,
  onChange,
  required = false,
  disabled = false,
  error = "",
  success = "",
  icon = null,
  iconColor = "",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const state = disabled ? "disabled" : error ? "error" : success ? "success" : "default";
  const styles = stateStyles[state];

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) ?? null,
    [options, value]
  );

  const getImageSrc = (option) =>
    option?.image || option?.avatar || getAvatarUrl(option?.label || "");

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, search]);

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      setSearch("");
    } else {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
      setIsOpen(true);
      setSearch("");
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label
          className={`absolute -top-2 left-2 z-10 px-1.5 text-xs pointer-events-none flex items-center gap-1 ${styles.label}`}
        >
          {icon && (
            <span className={iconColor || styles.icon}>
              {React.cloneElement(icon, { size: 11 })}
            </span>
          )}
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div
        ref={triggerRef}
        className={`
          w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border
          transition-all duration-150
          ${isOpen ? styles.wrapperOpen : styles.wrapper}
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        `}
        onClick={handleToggle}
      >
        {selectedOption && !search && (
          <img
            src={getImageSrc(selectedOption)}
            alt=""
            className="w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
            onError={(e) => (e.target.src = getAvatarUrl(selectedOption.label))}
          />
        )}

        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={selectedOption ? selectedOption.label : placeholder}
            className={`flex-1 text-sm bg-transparent outline-none border-none min-w-0 ${styles.input} placeholder:${styles.placeholder}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
                setSearch("");
              }
            }}
          />
        ) : (
          <span
            className={`flex-1 text-sm truncate ${
              selectedOption ? styles.input : styles.placeholder
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        )}

        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform duration-200 ${styles.icon} ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {error && (
        <p className="mt-1 text-[11.5px] text-red-500 pl-0.5">{error}</p>
      )}

      {success && !error && (
        <p className="mt-1 text-[11.5px] text-green-600 pl-0.5">{success} ✓</p>
      )}

      {isOpen && !disabled && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No matching options
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = value === option.value;
              return (
                <div
                  key={option.value}
                  className={`
                    flex items-center gap-3 px-2 py-1.5 cursor-pointer transition-colors duration-100
                    ${isSelected ? "bg-blue-50" : "hover:bg-[#eff4ff]"}
                  `}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  <img
                    src={getImageSrc(option)}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    onError={(e) => (e.target.src = getAvatarUrl(option.label))}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-900 truncate">
                      {option.label}
                    </p>
                    {option.sub && (
                      <p className="text-[11.5px] text-[#6b7280] truncate">{option.sub}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
