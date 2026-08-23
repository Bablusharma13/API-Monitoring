export default function Cell({
  value,
  defaultValue = "N/A",
  link = false,
  align = "left",
  className = "",
  linkName = null,
  otherLinkValue = null,
  prefix=null
}) {
  if (link) {
    return (
      <a
        href={otherLinkValue || value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 px-1"
      >
        {linkName || value}
      </a>
    );
  }

  const alignClass =
    align === "right" ? "text-right" :
    align === "center" ? "text-center" :
    "text-left";

  return (
    <span className={`block overflow-hidden px-1  ${alignClass} ${className}`}>
    {prefix && <span className="inline-block mr-2 align-middle">{prefix}</span>}
    <span className="inline-block max-w-full overflow-hidden whitespace-nowrap text-ellipsis align-middle">{value || defaultValue}</span>
  </span>
  );
}

// export default function Cell({
//   value,
//   defaultValue = "N/A",
//   link = false,
//   align = "left",
//   className = "",
//   linkName = null,
//   otherLinkValue = null,
//   prefix = null,
// }) {
//   if (link) {
//     return (
//       <a
//         href={otherLinkValue || value}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-600 hover:text-blue-800 px-1"
//       >
//         {linkName || value}
//       </a>
//     );
//   }

//   const alignClass =
//     align === "right" ? "text-right" :
//     align === "center" ? "text-center" :
//     "text-left";

//   return (
    
//     <div className={`flex items-center gap-2 px-1 ${alignClass}`}>
//       {prefix && <div className="shrink-0">{prefix}</div>}
//       <span className={`truncate ${alignClass}  ${className}`}>
//         {value || defaultValue}
//       </span>
//     </div>
//   );
// }
