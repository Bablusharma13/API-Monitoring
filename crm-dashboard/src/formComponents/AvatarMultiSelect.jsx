"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
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

const getRandomColor = () => {
  const colors = [
    "4f46e5", "7c3aed", "059669", "16a34a",
    "d97706", "f59e0b", "dc2626", "ea580c",
    "0ea5e9", "2563eb", "9333ea", "be185d",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const DEFAULT_AVATAR = `https://ui-avatars.com/api/?background=${getRandomColor()}&color=fff&name=`;

const MAX_VISIBLE = 3;

export default function AvatarMultiSelect({
  label = "",
  placeholder = "Select...",
  options = [],
  value = [],           // string[] of selected values
  onChange,             // (values: string[]) => void
  required = false,
  disabled = false,
  error = "",
  success = "",
  icon = null,
  iconColor = "",
  className = "",
  maxTags = MAX_VISIBLE,
  showSelectAll = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(() => new Set(value), [value]);
  const state = disabled ? "disabled" : error ? "error" : success ? "success" : "default";
  const styles = stateStyles[state];
  const allSelected = selected.size === options.length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const getImageSrc = (option) =>
    option?.image ||
    option?.avatar ||
    `${DEFAULT_AVATAR}${encodeURIComponent(option?.label || "")}`;

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, search]);

  const selectedOptions = useMemo(
    () => options.filter((o) => selected.has(o.value)),
    [options, selected]
  );

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

  const toggleAll = (e) => {
    e.stopPropagation();
    if (allSelected) onChange?.([]);
    else onChange?.(options.map((o) => o.value));
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange?.([]);
    setSearch("");
  };

  const visibleTags = selectedOptions.slice(0, maxTags);
  const overflowCount = selectedOptions.length - maxTags;

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>

      {/* Floating label */}
      {label && (
        <label className={`absolute -top-2 left-2 z-10 px-1.5 text-xs pointer-events-none flex items-center gap-1 ${styles.label}`}>
          {icon && (
            <span className={iconColor || styles.icon}>
              {React.cloneElement(icon, { size: 11 })}
            </span>
          )}
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border min-h-[42px]
          transition-all duration-150 flex-wrap
          ${isOpen ? styles.wrapperOpen : styles.wrapper}
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {/* Avatar stack when closed and items selected */}
        {!isOpen && selectedOptions.length > 0 && (
          <div className="flex items-center -space-x-2 flex-shrink-0">
            {visibleTags.map((opt) => (
              <img
                key={opt.value}
                src={getImageSrc(opt)}
                alt={opt.label}
                title={opt.label}
                className="w-6 h-6 rounded-full object-cover border-2 border-white flex-shrink-0"
                onError={(e) => (e.target.src = `${DEFAULT_AVATAR}${encodeURIComponent(opt.label)}`)}
              />
            ))}
            {overflowCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-medium flex-shrink-0">
                +{overflowCount}
              </span>
            )}
          </div>
        )}

        {/* Tags when open */}
        {isOpen && visibleTags.map((opt) => (
          <span
            key={opt.value}
            className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[12px] text-blue-700 whitespace-nowrap flex-shrink-0"
          >
            <img
              src={getImageSrc(opt)}
              alt=""
              className="w-4 h-4 rounded-full object-cover border border-blue-200"
              onError={(e) => (e.target.src = `${DEFAULT_AVATAR}${encodeURIComponent(opt.label)}`)}
            />
            {opt.label}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => deselect(opt.value, e)}
              className="flex items-center text-blue-600 hover:text-blue-600 transition-colors ml-0.5"
              tabIndex={-1}
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" />
              </svg>
            </button>
          </span>
        ))}

        {isOpen && overflowCount > 0 && (
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500 flex-shrink-0">
            +{overflowCount}
          </span>
        )}

        {/* Search input */}
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={selectedOptions.length === 0 ? placeholder : "Search..."}
            className={`flex-1 min-w-[80px] text-sm bg-transparent outline-none border-none ${styles.input} placeholder:text-gray-400`}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setIsOpen(false); setSearch(""); }
              if (e.key === "Backspace" && !search && selectedOptions.length > 0) {
                deselect(selectedOptions[selectedOptions.length - 1].value, e);
              }
            }}
          />
        ) : (
          selectedOptions.length === 0 && (
            <span className={`flex-1 text-sm ${styles.placeholder}`}>{placeholder}</span>
          )
        )}

        <ChevronDown
          size={16}
          className={`flex-shrink-0 ml-auto transition-transform duration-200 ${styles.icon} ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Error / success */}
      {error && <p className="mt-1 text-[11.5px] text-red-500 pl-0.5">{error}</p>}
      {success && !error && <p className="mt-1 text-[11.5px] text-green-600 pl-0.5">{success} ✓</p>}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">

          {/* Select all */}
          {showSelectAll && (
            <>
              <div
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleAll}
              >
                <div className={`w-[17px] h-[17px] rounded-[4px] flex items-center justify-center flex-shrink-0 border transition-all
                  ${allSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
                  {allSelected && (
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-gray-400">Select all</span>
              </div>
              <div className="border-t border-gray-100" />
            </>
          )}

          {/* Options */}
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No matching options</div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selected.has(option.value);
              return (
                <div
                  key={option.value}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors
                    ${isSelected ? "bg-blue-50" : "hover:bg-[#eff4ff]"}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggle(option.value)}
                >
                  <div className={`w-[17px] h-[17px] rounded-[4px] flex items-center justify-center flex-shrink-0 border transition-all
                    ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
                    {isSelected && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5">
                        <polyline points="2 6 5 9 10 3" />
                      </svg>
                    )}
                  </div>
                  <img
                    src={getImageSrc(option)}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    onError={(e) => (e.target.src = `${DEFAULT_AVATAR}${encodeURIComponent(option.label)}`)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-900 truncate">{option.label}</p>
                    {option.sub && (
                      <p className="text-[11.5px] text-gray-500 truncate">{option.sub}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 flex items-center justify-between px-3.5 py-2 sticky bottom-0 bg-white">
            <span className="text-[12px] text-gray-400">{selected.size} selected</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearAll}
              className="text-[12px] text-blue-600 hover:underline border-none bg-transparent cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
