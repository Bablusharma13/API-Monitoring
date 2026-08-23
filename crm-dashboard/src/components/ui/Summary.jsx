// components/ui/Summary.jsx
import React from "react";

const Summary = ({
  icon,
  title,
  subtitle,
  action,
  rows = [],
  variant = "grid",
}) => {
  const hasHeader = title || icon || action;

  const getValueColor = (color) => {
    switch (color) {
      case "green":
        return "text-green-600";
      case "red":
        return "text-red-500";
      default:
        return "text-[#1c1f2e]";
    }
  };

  return (
    <div className="bg-white border border-[#e9ebf0] rounded-[12px] overflow-hidden">
      {/* Header */}
      {hasHeader && (
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#e9ebf0] bg-[#fafbfc]">
          <div className="flex items-center gap-2.5">
            {icon && <span>{icon}</span>}

            {(title || subtitle) && (
              <div>
                {title && (
                  <p className="text-[14px] font-medium text-[#1c1f2e]">
                    {title}
                  </p>
                )}
                {subtitle && (
                  <p className="text-[11px] text-[#6b7280]">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      {/* SUMMARY VIEW */}
      {variant === "summary" ? (
      <div className="bg-[#f4f6fa] px-5 py-4">
      {rows.map((group, i) => (
        <div key={i}>
          {group.items?.map((item, idx) => {
            return (
              <div key={idx}>
                
                {/* SECTION GAP */}
                {item.sectionGap && (
                  <div className="h-4 border-t border-[#e5e7eb] my-2" />
                )}
    
                {/* ROW */}
                <div
                  className={`flex justify-between items-center py-2 border-b border-[#e5e7eb] border-below   ${
                    item.isHighlight
                      ? "text-[16px] font-semibold text-[#111827]"
                      : "text-[14px]"
                  }`}
                >
                  {/* Label */}
                  <span
                    className={`${
                      item.isHighlight
                        ? "text-[#111827]"
                        : "text-[#6b7280]"
                    }`}
                  >
                    {item.label}
                  </span>
    
                  {/* Value */}
                  <span
                    className={` ${getValueColor(
                      item.valueColor
                    )} ${item.isMuted ? "text-[#6b7280]" : ""}`}
                  >
                    {item.value ?? "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
      ) : (
        /* DEFAULT TABLE VIEW */
        <table className="w-full border-collapse">
          <tbody>
            {rows.map((row, rowIndex) => {
              if (row.section) {
                return (
                  <tr key={rowIndex}>
                    <td
                      colSpan="100%"
                      className="px-4 py-2 text-[10px] uppercase text-[#6b7280] bg-[#fafbfc] border-b"
                    >
                      {row.section}
                    </td>
                  </tr>
                );
              }

              const items = row.items || [];

              return (
                <React.Fragment key={rowIndex}>
                  <tr>
                    {items.map((item, i) => (
                      <th
                        key={i}
                        className="px-4 py-2 text-left text-[11px] uppercase text-[#6b7280] bg-[#fafbfc] border"
                      >
                        {item.label}
                      </th>
                    ))}
                  </tr>

                  <tr>
                    {items.map((item, i) => (
                      <td
                        key={i}
                        className="px-4 py-2 text-[13px] border"
                      >
                        {item.value ?? "—"}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export { Summary };