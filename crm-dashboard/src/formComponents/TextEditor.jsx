// "use client";

// import React, { useEffect } from "react";
// import { useQuill } from "react-quilljs";
// import "quill/dist/quill.snow.css";

// // 🎨 Same theme system
// const stateStyles = {
//   default: {
//     wrapper:
//       "border-gray-200 focus-within:border-blue-500 focus-within:ring-[3px] focus-within:ring-blue-500/15 bg-white",
//     label: "text-gray-500",
//   },
//   error: {
//     wrapper: "border-red-400 bg-red-50",
//     label: "text-red-500",
//   },
//   success: {
//     wrapper: "border-green-500 bg-green-50",
//     label: "text-green-600",
//   },
// };

// export default function CustomTextEditor({
//   label = "Description",
//   value = "",
//   onChange,
//   required = false,
//   error = "",
//   success = "",
//   placeholder = "Write something...",
// }) {
//   const { quill, quillRef } = useQuill({
//     theme: "snow",
//     placeholder,
//     modules: {
//       toolbar: [
//         [{ header: [1, 2, false] }],
//         ["bold", "italic", "underline"],
//         [{ list: "ordered" }, { list: "bullet" }],
//         ["link"],
//         ["clean"],
//       ],
//     },
//   });

//   // 🎯 State
//   const state = error ? "error" : success ? "success" : "default";
//   const styles = stateStyles[state];

//   // Sync value → editor
//   useEffect(() => {
//     if (quill && value !== quill.root.innerHTML) {
//       quill.root.innerHTML = value || "";
//     }
//   }, [value, quill]);

//   // Sync editor → parent
//   useEffect(() => {
//     if (quill) {
//       quill.on("text-change", () => {
//         const html = quill.root.innerHTML;
//         onChange?.(html);
//       });
//     }
//   }, [quill]);

//   return (
//     <div className="w-full relative">
      
//       {/* Floating Label */}
//       {label && (
//         <span
//           className={`absolute -top-[9px] left-2.5 px-1 text-[11px]
//           ${styles.label}
//           ${
//             state === "error"
//               ? "bg-red-50"
//               : state === "success"
//               ? "bg-green-50"
//               : "bg-white"
//           }`}
//         >
//           {label}
//           {required && <span className="text-red-500">*</span>}
//         </span>
//       )}

//       {/* Wrapper */}
//       <div
//         className={`border rounded-lg overflow-hidden transition-all
//         ${styles.wrapper}`}
//       >
//         {/* Editor */}
//         <div className="min-h-[120px] text-sm">
//           <div ref={quillRef} />
//         </div>
//       </div>

//       {/* Error */}
//       {error && (
//         <p className="mt-1 text-[11.5px] text-red-500 pl-0.5">{error}</p>
//       )}

//       {/* Success */}
//       {success && !error && (
//         <p className="mt-1 text-[11.5px] text-green-500 pl-0.5">
//           {success} ✓
//         </p>
//       )}
//     </div>
//   );
// }

"use client";

import React from "react";

const stateStyles = {
  default: {
    wrapper:
      "border-gray-200 focus-within:border-blue-500 focus-within:ring-[3px] focus-within:ring-blue-500/15 bg-white",
    label: "text-gray-500",
    input: "text-gray-900 placeholder:text-gray-300",
  },
  error: {
    wrapper: "border-red-400 bg-red-50",
    label: "text-red-500",
    input: "text-red-600 placeholder:text-red-300",
  },
  success: {
    wrapper: "border-green-500 bg-green-50",
    label: "text-green-600",
    input: "text-green-700 placeholder:text-green-400",
  },
  disabled: {
    wrapper: "border-gray-200 bg-gray-50",
    label: "text-gray-400",
    input: "text-gray-400 placeholder:text-gray-300",
  },
};

export default function CustomTextarea({
  label = "Description",
  value,
  onChange,
  placeholder = "Write something...",
  required = false,
  disabled = false,
  error = "",
  success = "",
  rows = 4,
  icon = null,
  iconColor = "",
}) {
  const state = disabled
    ? "disabled"
    : error
    ? "error"
    : success
    ? "success"
    : "default";

  const styles = stateStyles[state];

  return (
    <div className="w-full">
      
      {/* Wrapper */}
      <div
        className={`relative border rounded-lg px-3 pt-3 pb-2 transition-all
        ${styles.wrapper}`}
      >
        {/* Floating Label */}
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
                     )}   {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        )}

        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`w-full resize-none outline-none bg-transparent text-[13.5px]
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
    </div>
  );
}