

import React, { useState, useMemo, useRef, useEffect } from "react";

export function ColPanel({
  columns,
  defaultVisible = null,
  onToggleVisible,
  onTogglePin,
  onReorder,
  onRestoreDefault,
  group = {},
}) {
  const gc = (g) =>
    group[g] || { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" };
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const dragSrcId = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const hasGroupConfig = Object.keys(group).length > 0;

  // Separate serial_no from rest — it sits fixed at top, outside groups
  const serialNoCol = columns.find((c) => c.id === "serial_no");
  const regularColumns = columns.filter((c) => c.id !== "serial_no");

  const filteredRegular = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return regularColumns;
    return regularColumns.filter((col) => col.name.toLowerCase().includes(q));
  }, [regularColumns, search]);

  // Select All logic — only over regular (non serial_no) columns
  // const allVisible = filteredRegular.every((c) => c.visible);
  // const someVisible = filteredRegular.some((c) => c.visible);
  // const handleSelectAll = () => {
  //     if (allVisible) {
  //         // Hide all
  //         filteredRegular.forEach((c) => { if (c.visible) onToggleVisible(c.id); });
  //     } else {
  //         // Show all
  //         filteredRegular.forEach((c) => { if (!c.visible) onToggleVisible(c.id); });
  //     }
  // };
  const toggleableCols = filteredRegular.filter((c) => !c.default);
  const allVisible = toggleableCols.every((c) => c.visible);
  const handleSelectAll = () => {
    if (allVisible) {
      toggleableCols.forEach((c) => {
        if (c.visible) onToggleVisible(c.id);
      });
    } else {
      toggleableCols.forEach((c) => {
        if (!c.visible) onToggleVisible(c.id);
      });
    }
  };

  const grouped = useMemo(() => {
    if (!hasGroupConfig) return null;
    const result = {};
    filteredRegular.forEach((col) => {
      const grpKey = col.group || "__ungrouped__";
      if (!result[grpKey]) result[grpKey] = [];
      result[grpKey].push(col);
    });
    return result;
  }, [filteredRegular, hasGroupConfig]);

  // Normal draggable column row
  const renderColRow = (col, hex = "#6b7280") => (
    <div
      key={col.id}
      draggable
      data-id={col.id}
      onDragStart={(e) => {
        dragSrcId.current = col.id;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", col.id);
        e.currentTarget.style.opacity = "0.4";
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.borderTop = "";
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        e.currentTarget.style.borderTop = `2px solid ${hex}`;
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.borderTop = "";
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderTop = "";
        const toId = e.currentTarget.dataset.id;
        const fromId =
          dragSrcId.current || e.dataTransfer.getData("text/plain");
        dragSrcId.current = null;
        if (fromId && fromId !== toId) onReorder(fromId, toId);
      }}
      className="flex items-center gap-2 px-3.5 py-[7px] border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-default"
    >
      <div
        title="Drag to reorder"
        className="flex flex-col gap-[3px] cursor-grab flex-shrink-0 px-0.5 opacity-60 hover:opacity-100 transition-opacity"
      >
        {[0, 1, 2].map((r) => (
          <div key={r} className="flex gap-[3px]">
            <span className="block w-[3px] h-[3px] bg-gray-400 rounded-full" />
            <span className="block w-[3px] h-[3px] bg-gray-400 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex-1 text-[13px] text-gray-800 select-none">
        {col.name}
      </div>
      <button
        onClick={() => onTogglePin(col.id)}
        title={col.pinned ? "Unpin" : "Pin"}
        className={`flex-shrink-0 cursor-pointer bg-transparent border-none p-0 flex transition-colors ${col.pinned ? "text-amber-400" : "text-gray-300 hover:text-amber-400"}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 17v5" />
          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v3.76z" />
        </svg>
      </button>
      {/* <button
        onClick={() => onToggleVisible(col.id)}
        className={`flex-shrink-0 cursor-pointer bg-transparent border-none p-0 flex transition-colors ${col.visible ? "text-blue-600" : "text-gray-300"}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button> */}
      <button
        onClick={() => !col.default && onToggleVisible(col.id)}
        title={col.default ? "Required column" : col.visible ? "Hide" : "Show"}
        className={`flex-shrink-0 bg-transparent border-none p-0 flex transition-colors ${
          col.default
            ? "cursor-not-allowed text-blue-300"
            : col.visible
              ? "cursor-pointer text-blue-600"
              : "cursor-pointer text-gray-300"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    </div>
  );

  // Fixed non-draggable row (for serial_no)
  const renderFixedRow = (col) => (
    <div
      key={col.id}
      className="flex items-center gap-2 px-3.5 py-[7px] border-b border-gray-100 bg-gray-50/50"
    >
      {/* No drag handle — just a spacer to align with regular rows */}
      <div className="flex flex-col gap-[3px] flex-shrink-0 px-0.5 opacity-0 pointer-events-none">
        {[0, 1, 2].map((r) => (
          <div key={r} className="flex gap-[3px]">
            <span className="block w-[3px] h-[3px] bg-gray-400 rounded-full" />
            <span className="block w-[3px] h-[3px] bg-gray-400 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex-1 text-[13px] text-gray-500 select-none">
        {col.name}
      </div>
      {/* No pin button for serial_no */}
      <div className="w-[14px] flex-shrink-0" />
      {/* Always visible checkmark — locked */}
      <div className="flex-shrink-0 text-blue-300 flex">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    </div>
  );

  return (
    <div
      className="w-[320px] bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-2xl max-h-[450px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search bar */}
      <div className="px-3.5 pt-3.5 pb-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-blue-600 transition-colors">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search columns…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none outline-none text-[13px] text-gray-800 bg-transparent w-full placeholder-gray-300"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="border-none bg-transparent cursor-pointer p-0 flex text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Select All + Restore bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-gray-100 flex-shrink-0">
        <span className="text-[12px] text-gray-400">
          {/* {filteredRegular.filter((c) => c.visible).length} /{" "}
          {filteredRegular.length} selected */}
          {toggleableCols.filter((c) => c.visible).length} /{" "}
          {toggleableCols.length} selected
        </span>
        <div className="flex items-center gap-2">
          {/* <span className="text-gray-200">|</span> */}
          <button
            onClick={handleSelectAll}
            className={`text-[12px] font-medium cursor-pointer border-none bg-transparent transition-colors ${allVisible ? "text-red-400 hover:text-red-600" : "text-blue-600 hover:text-blue-700"}`}
          >
            {allVisible ? "Hide All" : "Select All"}
          </button>
        </div>
      </div>

      {/* Column list */}
      <div className="overflow-y-auto flex-1">
        {/* serial_no is intentionally excluded from Select Columns panel */}

        {filteredRegular.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-gray-400">
            No columns found
          </div>
        ) : hasGroupConfig && grouped ? (
          // GROUPED view
          Object.entries(grouped).map(([grp, cols]) => {
            const isUngrouped = grp === "__ungrouped__";
            const { hex, bg, text } = gc(isUngrouped ? "" : grp);
            return (
              <div key={grp}>
                {!isUngrouped && (
                  <div
                    className={`flex items-center gap-1.5 px-3.5 py-2 ${bg} border-t border-b border-gray-100`}
                  >
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 12 12"
                      fill={hex}
                      className="flex-shrink-0"
                    >
                      <circle cx="6" cy="6" r="6" />
                    </svg>
                    <span
                      className={`text-[12px] font-normal tracking-[.08em] ${text}`}
                    >
                      {grp}
                    </span>
                  </div>
                )}
                {cols.map((col) => renderColRow(col, hex))}
              </div>
            );
          })
        ) : (
          // FLAT view
          filteredRegular.map((col) => renderColRow(col, "#6b7280"))
        )}
      </div>
    </div>
  );
}

export default ColPanel;
