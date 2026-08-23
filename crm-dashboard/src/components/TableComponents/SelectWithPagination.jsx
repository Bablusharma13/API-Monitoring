// /* eslint-disable no-unused-vars */
// import { useState, useEffect, useRef, useCallback } from "react";
// import PortalWrapper from "./PortalWrapper";
// import { ChevronDown } from "lucide-react";

// const SelectWithPagination = ({
//   limit,
//   setLimit,
//   totalRecords = 0,
//   tableName = "",
//   openUpward = false,
// }) => {
//   const PAGE_UNIT = 10;
//   const MAX_CAP = 1000;

//   const generatePageLimits = (total) => {
//     if (!total || total <= 0) return [PAGE_UNIT];

//     const top = Math.min(MAX_CAP, Math.ceil(total / PAGE_UNIT) * PAGE_UNIT);

//     const multiples = [];
//     for (let v = PAGE_UNIT; v <= top; v += PAGE_UNIT) {
//       multiples.push(v);
//     }

//     return multiples;
//   };

//   const limitIdentifier = `limit_${tableName || "default"}`;
//   const selectRef = useRef(null);
//   const portalContentRef = useRef(null);

//   const [isOpen, setIsOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);

//   const optionsList = generatePageLimits(totalRecords);
//   const options = optionsList.map((n) => ({ value: n, label: String(n) }));
//   const selectedOption = options.find((o) => o.value === limit);

//   // init limit from localStorage or fallback
//   useEffect(() => {
//     const stored = localStorage.getItem(limitIdentifier);
//     const parsed = stored ? parseInt(stored, 10) : NaN;

//     if (!Number.isNaN(parsed) && optionsList.includes(parsed)) {
//       if (parsed !== limit) setLimit(parsed);
//       return;
//     }

//     if (!optionsList.includes(limit)) {
//       const first = optionsList[0] ?? PAGE_UNIT;
//       setLimit(first);
//       localStorage.setItem(limitIdentifier, String(first));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [totalRecords, tableName]);

//   const handleSelect = (option) => {
//     setLimit(option.value);
//     localStorage.setItem(limitIdentifier, String(option.value));
//     setIsOpen(false);
//   };

//   const [dropdownPosition, setDropdownPosition] = useState({
//     top: 0,
//     left: 0,
//     width: 0,
//   });

//   const paginatedOptions = options.slice(
//     (currentPage - 1) * PAGE_UNIT,
//     currentPage * PAGE_UNIT
//   );

//   const computePosition = useCallback(() => {
//     const inputEl = selectRef.current;
//     const contentEl = portalContentRef.current;
//     if (!inputEl) return;

//     const rect = inputEl.getBoundingClientRect();
//     let top = rect.bottom + 4;

//     if (openUpward) {
//       // Estimate height: each option is ~32px (py-2 = 8px top+bottom, text-xs line-height ~16px)
//       // Plus gap-1 between items, and padding
//       const estimatedItemHeight = 32;
//       const estimatedHeight = Math.min(
//         paginatedOptions.length * estimatedItemHeight + 8, // 8px padding
//         160 // max-h-40
//       );

//       // Use actual height if available, otherwise use estimate
//       const dropdownHeight = contentEl
//         ? contentEl.getBoundingClientRect().height
//         : estimatedHeight;

//       top = rect.top - dropdownHeight - 4;

//       // Ensure dropdown doesn't go above viewport
//       if (top < 0) {
//         top = rect.bottom + 4; // Fallback to opening downward
//       }
//     }

//     setDropdownPosition({
//       top,
//       left: rect.left,
//       width: rect.width,
//     });
//   }, [openUpward, paginatedOptions.length]);

//   useEffect(() => {
//     if (!isOpen) return;

//     // Use double requestAnimationFrame to ensure DOM is fully rendered before measuring
//     requestAnimationFrame(() => {
//       requestAnimationFrame(() => {
//         computePosition();
//       });
//     });

//     const handle = () => computePosition();
//     window.addEventListener("resize", handle);
//     window.addEventListener("scroll", handle, true);
//     return () => {
//       window.removeEventListener("resize", handle);
//       window.removeEventListener("scroll", handle, true);
//     };
//   }, [isOpen, computePosition]);

//   const toggleOpen = () => {
//     setIsOpen((prev) => {
//       const next = !prev;
//       if (!prev) {
//         // slight delay allows ref/layout to settle in some cases
//         requestAnimationFrame(() => computePosition());
//       }
//       return next;
//     });
//   };

//   return (
//     <div
//       className="relative inline-block" // inline-block so it doesn't expand full-width
//       ref={selectRef}
//     >
//       {/* INPUT WITH ICON INSIDE - fixed small width */}
//       <div className="relative">
//         <input
//           type="text"
//           readOnly
//           value={selectedOption?.label ?? ""}
//           onClick={toggleOpen}
//           className="border rounded px-1 py-1 pr-6 text-xs text-default focus:outline-none focus:ring w-14 text-center cursor-pointer"
//           aria-haspopup="listbox"
//           aria-expanded={isOpen}
//         />

//         {/* Clickable icon inside input */}
//         <button
//           type="button"
//           onClick={(e) => {
//             e.stopPropagation(); // prevent double toggle from input if any
//             toggleOpen();
//           }}
//           aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
//           className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 flex items-center justify-center"
//         >
//           <ChevronDown
//             className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
//           />
//         </button>
//       </div>

//       {/* PORTAL DROPDOWN */}
//       <PortalWrapper
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//         position={{
//           top: dropdownPosition.top,
//           left: dropdownPosition.left,
//         }}
//        className="z-50 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden"

//         style={{ width: dropdownPosition.width || undefined }}
//         contentRef={portalContentRef}
//         referenceRef={selectRef}
//       >
//         {paginatedOptions.length > 0 ? (
//          <div className="flex flex-col py-1">

//             {paginatedOptions.map((option) => (
//               <div
//                 key={option.value}
//                 onClick={() => handleSelect(option)}
//                 role="option"
//                 aria-selected={limit === option.value}
//                 className={`cursor-pointer px-3 text-xs py-2 hover:bg-gray-100 ${limit === option.value ? "bg-gray-100 font-medium" : ""
//                   }`}
//               >
//                 {option.label}
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="px-3 py-2 text-default">No options</div>
//         )}
//       </PortalWrapper>
//     </div>
//   );
// };

// export default SelectWithPagination;




/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useCallback } from "react";
import PortalWrapper from "./PortalWrapper";
import { ChevronDown } from "lucide-react";

const SelectWithPagination = ({
  limit,
  setLimit,
  setPageIndex, // ADDED: to reset page when limit changes
  totalRecords = 0,
  tableName = "",
  openUpward = false,
}) => {
  const PAGE_UNIT = 10;
  // REMOVED: MAX_CAP constant (no longer needed)

  // REPLACED: generatePageLimits function with fixed base limits logic
  // This generates [10, 25, 50, 100, 200, 500] intelligently based on totalRecords
  const generatePageLimits = (totalRecords) => {
    const baseLimits = [10, 25, 50, 100, 200, 500];
    if (!totalRecords || totalRecords <= 0) {
      return [10];
    }
    const validLimits = [];
    for (let i = 0; i < baseLimits.length; i++) {
      const limit = baseLimits[i];
      if (limit < totalRecords) {
        validLimits.push(limit);
      } else if (limit >= totalRecords && validLimits.length === 0) {
        validLimits.push(limit);
        break;
      } else if (limit >= totalRecords && validLimits.length > 0) {
        validLimits.push(limit);
        break;
      }
    }
    if (validLimits.length === 0) {
      validLimits.push(10);
    }
    return [...new Set(validLimits)].sort((a, b) => a - b);
  };

  const limitIdentifier = `limit_${tableName || "default"}`;
  const selectRef = useRef(null);
  const portalContentRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // MODIFIED: options generation now uses generatePageLimits result directly
  const options = generatePageLimits(totalRecords).map((val) => ({
    value: val,
    label: String(val),
  }));
  const selectedOption = options.find((o) => o.value === limit);

  // REPLACED: initialization logic from first component
  // - Reads localStorage and validates against current options
  // - Falls back to first option if stored value is invalid
  // - CHANGED dependency array to [totalRecords] only (removed tableName)
  useEffect(() => {
    // Skip when totalRecords is 0 — this happens transiently during page
    // navigation (TanStack Query v5 clears data while fetching), and firing
    // setLimit here would call setCurrentPage(1) and reset the page.
    if (!totalRecords || totalRecords <= 0) return;
    const storedValue = localStorage.getItem(limitIdentifier);
    const parsedValue = storedValue !== null ? parseInt(storedValue, 10) : NaN;
    if (
      storedValue !== null &&
      !isNaN(parsedValue) &&
      options.find((o) => o.value === parsedValue)
    ) {
      if (parsedValue !== limit) setLimit(parsedValue);
    } else if (options.length > 0) {
      if (options[0].value !== limit) setLimit(options[0].value);
      localStorage.setItem(limitIdentifier, String(options[0].value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalRecords]);

  const handleSelect = (option) => {
    setLimit(option.value);
    localStorage.setItem(limitIdentifier, String(option.value));
    setIsOpen(false);
    // ADDED: Reset to page 1 when limit changes (from first component)
    if (setPageIndex) {
      
      setPageIndex(0);
    }
  };

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const paginatedOptions = options.slice(
    (currentPage - 1) * PAGE_UNIT,
    currentPage * PAGE_UNIT
  );

  const computePosition = useCallback(() => {
    const inputEl = selectRef.current;
    const contentEl = portalContentRef.current;
    if (!inputEl) return;

    const rect = inputEl.getBoundingClientRect();
    let top = rect.bottom + 4;

    if (openUpward) {
      const estimatedItemHeight = 32;
      const estimatedHeight = Math.min(
        paginatedOptions.length * estimatedItemHeight + 8,
        160
      );

      const dropdownHeight = contentEl
        ? contentEl.getBoundingClientRect().height
        : estimatedHeight;

      top = rect.top - dropdownHeight - 4;

      if (top < 0) {
        top = rect.bottom + 4;
      }
    }

    setDropdownPosition({
      top,
      left: rect.left,
      width: rect.width,
    });
  }, [openUpward, paginatedOptions.length]);

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        computePosition();
      });
    });

    const handle = () => computePosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [isOpen, computePosition]);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!prev) {
        requestAnimationFrame(() => computePosition());
      }
      return next;
    });
  };

  return (
    <div className="relative inline-block" ref={selectRef}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={selectedOption?.label ?? ""}
          onClick={toggleOpen}
          className="border border-gray-200 rounded-md h-7 px-1 pr-6 text-[12.5px] text-gray-500 bg-white focus:outline-none w-14 text-center cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-all"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
          aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 flex items-center justify-center"
        >
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <PortalWrapper
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
        }}
        className="z-50 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden"
        style={{ width: dropdownPosition.width || undefined }}
        contentRef={portalContentRef}
        referenceRef={selectRef}
      >
        {paginatedOptions.length > 0 ? (
          <div className="flex flex-col py-1">
            {paginatedOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={limit === option.value}
                className={`cursor-pointer px-3 text-[12.5px] text-gray-500 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  limit === option.value ? "bg-blue-50 text-blue-600 font-medium" : ""
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-2 text-default">No options</div>
        )}
      </PortalWrapper>
    </div>
  );
};

export default SelectWithPagination;
