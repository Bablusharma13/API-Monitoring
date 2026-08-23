"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { defaultCountries } from "react-international-phone";

// 🌍 Countries
const countries = defaultCountries.map((c) => ({
  name: c[0],
  code: c[1].toUpperCase(),
  dial: "+" + c[2],
}));

// 🎨 Theme
const stateStyles = {
  default: {
    wrapper:
      "border-gray-200 bg-white",
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

export default function CountrySelect({
  label = "Select Country",
  required = false,
  disabled = false,
  error = "",
    success = "",
    icon = null,
  iconColor = "",
  onChange,
}) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focus, setFocus] = useState(false);

  const wrapperRef = useRef(null);

  // 🔍 Filter
  const filteredCountries = useMemo(() => {
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search)
    );
  }, [search]);

  // 🎯 State
  const state = disabled
    ? "disabled"
    : error
    ? "error"
    : success
    ? "success"
    : "default";

  const styles = stateStyles[state];

  // ❌ Close outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setFocus(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={wrapperRef}>
      
      {/* Label */}
      {label && (
        <span
          className={`absolute -top-[9px] left-2.5 px-1 text-[11px] flex items-center gap-1
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
                               )}   {label} {label}
          {required && <span className="text-red-500">*</span>}
        </span>
      )}

      {/* Wrapper */}
      <div
        tabIndex={0}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
            setFocus(true);
          }
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className={`flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer transition-all
          ${styles.wrapper}
          ${
            focus && state === "default"
              ? "border-blue-500 ring-[3px] ring-blue-500/15"
              : ""
          }`}
      >
        {/* LEFT */}
        <div className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <ReactCountryFlag
                countryCode={selectedCountry.code}
                svg
                style={{ width: 16, height: 16 }}
              />
              <span className={`text-[13.5px] ${styles.input}`}>
                {selectedCountry.name}
              </span>
            </>
          ) : (
            <span className="text-gray-400 text-[13.5px]">
              Select country
            </span>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* ❌ Clear */}
          {selectedCountry && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCountry(null);
                onChange?.(null);
              }}
              className="text-gray-400 hover:text-gray-500 text-[11px]"
            >
              ✕
            </button>
          )}

          <ChevronDown size={16} className={styles.icon} />
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

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* List */}
          <div className="max-h-60 overflow-auto">
            {filteredCountries.map((c) => (
              <div
                key={c.code}
                onClick={() => {
                  setSelectedCountry(c);
                  setOpen(false);
                  setSearch("");
                  setFocus(false);
                  onChange?.(c);
                }}
                className={`flex items-center justify-between px-2.5 py-2.5 cursor-pointer transition
                  ${
                    selectedCountry?.code === c.code
                      ? "bg-[#eff4ff]"
                      : "hover:bg-[#eff4ff]"
                  }`}
              >
                {/* LEFT */}
                <div className="flex items-center gap-3">
                  <ReactCountryFlag
                    countryCode={c.code}
                    svg
                    style={{ width: 16, height: 14 }}
                  />
                  <span
                    className={`text-[13.5px] ${
                      selectedCountry?.code === c.code
                        ? "text-[#2563eb] font-[300]"
                        : "text-gray-700 font-[300]"
                    }`}
                  >
                    {c.name}
                  </span>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">
                  {selectedCountry?.code === c.code && (
                    <span className="text-[#2563eb] text-sm">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}