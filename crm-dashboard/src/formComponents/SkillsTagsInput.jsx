import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { GiCheckMark } from "react-icons/gi";

const XMarkIcon = () => (
  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SkillsTagsInput = ({
  label = "",
  skills = [],
  onChange,
  suggestions = [],
  placeholder = "Select skills...",
  required = false,
  zIndex = 10,
  maxSkills = 15,
  
  // ✅ NEW PROPS  
  state = "default", // default | error | success | warning
  message = "",
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // ✅ State styles
  const stateStyles = {
    default: "border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-100",
    error: "border-red-500 focus-within:border-red-500 focus-within:ring-red-100", 
    success: "border-green-500 focus-within:border-green-500 focus-within:ring-green-100",
    warning: "border-yellow-500 focus-within:border-yellow-500 focus-within:ring-yellow-100",
  };
  const dropdownStyles = {
    default: "border-blue-500 ring-blue-100",
    error: "border-red-500 ring-red-100",
    success: "border-green-500 ring-green-100",
    warning: "border-yellow-500 ring-yellow-100",
  };
  const filteredSuggestions = suggestions
    .filter(
      (s) =>
        (inputValue
          ? s.toLowerCase().includes(inputValue.toLowerCase().trim())
          : true) &&
        !skills.some((added) => added.toLowerCase() === s.toLowerCase())
    )
    .slice(0, 8);

  const addSkill = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (maxSkills && skills.length >= maxSkills) {
      return toast.error(`Maximum ${maxSkills} skills allowed`);
    }

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error(`"${trimmed}" already added`);
    }

    onChange?.([...skills, trimmed]);
    setInputValue("");
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const removeSkill = (skillToRemove) => {
    if (disabled) return;
    onChange?.(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
        addSkill(filteredSuggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) addSkill(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) return;
    setShowDropdown(
      (inputValue.trim().length > 0 || document.activeElement === inputRef.current) &&
        filteredSuggestions.length > 0
    );
    setSelectedIndex(-1);
  }, [inputValue, filteredSuggestions.length, disabled]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ zIndex }}>
      {/* Label */}
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input Box */}
      <div
  onClick={() => {
    if (!disabled) {
      inputRef.current?.focus();
      setShowDropdown(true);
    }
  }}
  className={`flex flex-wrap items-center gap-2 w-full rounded-lg px-3 py-2 min-h-[44px] 
    transition-all border ${
    showDropdown 
      ? "rounded-b-none focus-within:shadow-[0_-2px_0_0_rgba(59,130,246,0.2),2px_0_0_0_rgba(59,130,246,0.2),-2px_0_0_0_rgba(59,130,246,0.2)]" 
      : "focus-within:ring-2 focus-within:ring-blue-100"
  } ${stateStyles[state]} ${
    disabled 
      ? "bg-gray-100 cursor-not-allowed border-[#e9ebf0]"
      : "bg-white cursor-text"
  }`}
>
        {/* Chips */}
        {skills.map((skill) => (
          <span 
            key={skill}
            className={`flex items-center gap-1 px-2.5 py-0.5 text-[11.5px] rounded-xl border
            ${
              disabled
                ? "bg-gray-200 text-gray-500 border-gray-300"  
                : "bg-[#eff4ff] text-[#2563eb] border-[#bfdbfe] font-[300]"
            }`}
          >
            {skill}
            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSkill(skill);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <XMarkIcon />
              </button>
            )}
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] text-sm outline-none border-none 
placeholder-[12px] placeholder-gray-300 placeholder:font-sm bg-transparent  placeholder:text-[12px]
  
  "
        />
        
        {/* Icon */}
        <ChevronDownIcon />
      </div>
      
      {/* Dropdown */}
      {showDropdown && !disabled && (
    <ul
    className={`absolute z-20 top-full left-0 w-full max-h-60 overflow-auto
    bg-white rounded-b-lg transition-all border border-t-transparent
    ${dropdownStyles[state]}
    ${showDropdown ? "ring-2" : "border-gray-300"}`}
  >
    {filteredSuggestions.map((suggestion, idx) => (
      <li
        key={suggestion}
        onClick={() => addSkill(suggestion)}
        onMouseEnter={() => setSelectedIndex(idx)}
        className={`flex items-center justify-between px-4 py-2 text-[13px] cursor-pointer transition
        ${
          idx === selectedIndex
            ? "bg-blue-50 text-[#2563eb] font-[300]"
            : "hover:bg-gray-50 text-gray-700"  
        }`}
      >
        <span className="flex items-center gap-1">
        <GiCheckMark size={12} />
          {suggestion}
        </span>
      </li>
    ))}
  </ul>
      )}
      
      {/* Message */}
      {message && (
        <p 
          className={`mt-1 text-xs ${
            state === "error"
              ? "text-red-500"
              : state === "success"
              ? "text-green-600" 
              : state === "warning"
              ? "text-yellow-600"
              : "text-gray-500"
          }`}
        >
          {message}
        </p>  
      )}
    </div>
  );
};

export default SkillsTagsInput;