// components/InfoTable.jsx
import React from "react";

const InfoTable = ({ icon, title, subtitle, action, rows = [] }) => {
  const hasHeader = title || icon || action;

  return (
    <div className="bg-white border border-[#e9ebf0] rounded-[10px] overflow-hidden">
      {/* Header */}
      {hasHeader && (
        <div className="flex items-center justify-between px-[16px] py-[16px] border-b border-[#e9ebf0] bg-[#fafbfc]">
          
          {/* Left Side */}
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="flex items-center justify-center">
                {icon}
              </span>
            )}

            {(title || subtitle) && (
              <div>
                {title && (
                  <p className="text-[13.5px] tracking-[.06em] text-[#1c1f2e]">
                    {title}
                  </p>
                )}
                {subtitle && (
                  <p className="text-[10px] tracking-[.06em] text-[#6b7280]">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Custom Action */}
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Table */}
      <table className="w-full border-collapse">
        <tbody>
          {rows.map((row, rowIndex) => {
            // SECTION TITLE
            if (row.section) {
              return (
                <tr key={rowIndex}>
                  <td
                    colSpan="100%"
                    className="px-4 py-2 text-[10px] tracking-[.06em] uppercase text-[#6b7280] bg-[#fafbfc] border-b border-[#e9ebf0]"
                  >
                    {row.section}
                  </td>
                </tr>
              );
            }

            const items = row.items || [];

            return (
              <React.Fragment key={rowIndex}>
                {/* LABEL ROW */}
                <tr>
                  {items.map((item, i) => (
                    <Th key={i} colSpan={item.colSpan || 1}>
                      {item.label}
                    </Th>
                  ))}
                </tr>

                {/* VALUE ROW */}
                <tr>
                  {items.map((item, i) => (
                    <Td key={i} colSpan={item.colSpan || 1}>
                      {item.value ?? "—"}
                    </Td>
                  ))}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const Th = ({ children, colSpan = 1 }) => (
  <th
    colSpan={colSpan}
    className="px-4 py-2 text-left text-[11px] tracking-[.06em] uppercase text-[#6b7280] bg-[#fafbfc] border-b border-r border-[#e9ebf0] last:border-r-0 font-normal"
  >
    {children}
  </th>
);

const Td = ({ children, link, colSpan = 1, isLast }) => (
  <td
    colSpan={colSpan}
    className={`px-4 py-[11px] text-[13.5px] border-r border-[#e9ebf0] last:border-r-0 align-middle
      ${!isLast ? "border-b border-[#e9ebf0]" : ""}
      ${link ? "text-blue-600" : "text-[#1c1f2e]"}`}
  >
    {children}
  </td>
);

export { InfoTable };