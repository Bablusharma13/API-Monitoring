"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { defaultCountries } from "react-international-phone";
import { PhoneNumberUtil, PhoneNumberType } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

// 🌍 Countries
const countries = defaultCountries.map((c) => ({
    name: c[0],
    code: c[1].toUpperCase(),
    dial: "+" + c[2],
}));

// 🎨 Same theme as Input component
const stateStyles = {
    default: {
        wrapper: "border-gray-200 focus-within:border-blue-500 focus-within:ring-[3px] focus-within:ring-blue-500/15 bg-white",
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

export default function CustomPhoneInput({
    label = "Phone number",
    icon = null,
    iconColor = "",
    value,
    onChange,
    required = true,
    disabled = false,
    success = "",
}) {
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [open, setOpen] = useState(false);
    const [phone, setPhone] = useState("");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const wrapperRef = useRef(null);

    // 🔍 Filter countries
    const filteredCountries = useMemo(() => {
        return countries.filter(
            (c) =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.dial.includes(search)
        );
    }, [search]);

    // 📱 Handle input change
    const handleChange = (val) => {
        setPhone(val);
        onChange?.(`${selectedCountry.dial}${val}`);
    };

    // 🎯 State logic (same as Input)
    const state = disabled
        ? "disabled"
        : error
            ? "error"
            : success
                ? "success"
                : "default";

    const styles = stateStyles[state];

    // ✅ Validation
    const handleBlur = () => {
        let errorMsg = "";
        const fullNumber = `${selectedCountry.dial}${phone}`;

        if (!phone) {
            errorMsg = required ? "Phone number is required" : "";
            setError(errorMsg);
            return;
        }

        try {
            const parsed = phoneUtil.parseAndKeepRawInput(
                fullNumber,
                selectedCountry.code
            );

            if (!phoneUtil.isValidNumber(parsed)) {
                errorMsg = "Invalid phone number";
            } else {
                const type = phoneUtil.getNumberType(parsed);
                if (
                    type !== PhoneNumberType.MOBILE &&
                    type !== PhoneNumberType.FIXED_LINE_OR_MOBILE
                ) {
                    errorMsg = "Enter valid mobile number";
                }
            }
        } catch {
            errorMsg = "Invalid format";
        }

        setError(errorMsg);
    };

    // ❌ Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full relative" ref={wrapperRef}>

            {/* Floating Label */}
            {label && (
                <span
                    className={`absolute -top-[9px] left-2.5 px-1 flex items-center gap-1 text-[11px] leading-none
          ${styles.label}
          ${state === "error"
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

            {/* Wrapper */}
            <div
                className={`flex border rounded-lg overflow-hidden transition-all ${styles.wrapper}`}
            >
                {/* Country Select */}
                <div
                    onClick={() => !disabled && setOpen((prev) => !prev)}
                    className={`flex items-center gap-2 px-3 cursor-pointer border-r
          ${state === "error"
                            ? "border-red-400"
                            : state === "success"
                                ? "border-green-500"
                                : "border-gray-200"
                        }`}
                >
                    <div className="w-4 h-4 flex items-center justify-center overflow-hidden">
                        <ReactCountryFlag
                            countryCode={selectedCountry.code}
                            svg
                            style={{ width: "100%", height: "100%" }}
                        />
                    </div>

                    <span className={`text-[13px] ${styles.input}`}>
                        {selectedCountry.dial}
                    </span>

                    <ChevronDown size={14} className={styles.icon} />
                </div>

                {/* Input */}
                <input
                    type="tel"
                    value={phone}
                    disabled={disabled}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Phone number"
                    className={`flex-1 px-3 py-2 text-[13.5px] outline-none bg-transparent 
            ${styles.input}
            disabled:cursor-not-allowed`}
                />
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
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg  overflow-hidden">

                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search country..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-sm outline-none placeholder:text-gray-400 placeholder:text-xs placeholder:font-normal"
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
                                }}
                                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer  transition
        ${selectedCountry.code === c.code
                                        ? "bg-[#eff4ff]"
                                        : "hover:bg-[#eff4ff]"
                                    }`}
                            >
                                {/* LEFT */}
                                <div className="flex items-center gap-3">

                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <ReactCountryFlag
                                            countryCode={c.code}
                                            svg
                                            style={{ width: "100%", height: "100%" }}
                                        />
                                    </div>
                                    <span
                                        className={`text-[13.5px] ${selectedCountry.code === c.code
                                                ? "text-[#2563eb] font-[300]"
                                                : "text-gray-700 font-[300]"
                                            }`}
                                    >
                                        {c.name}
                                    </span>
                                </div>

                                {/* RIGHT */}
                                <span
                                    className={`text-[13px] ${selectedCountry.code === c.code
                                            ? "text-[#2563eb]"
                                            : "text-gray-400 font-[300]"
                                        }`}
                                >
                                    {c.dial}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}