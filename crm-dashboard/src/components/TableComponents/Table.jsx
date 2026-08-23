/**
 * Table - A feature-rich data table component
 * Fixes in this version:
 * - Sticky pinned columns work correctly on LEFT→RIGHT scroll
 * - Removed position:relative from scroll container (was breaking sticky)
 * - Table width is max-content so it truly overflows and scrolls
 * - will-change:transform on sticky cells forces GPU compositing
 * - Double-click # header to auto-fit all columns
 * - Double-click column header to auto-fit that column
 * - Group header row only shown when at least one col has a group
 * - Move Left/Right removed from column dropdown
 */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import HeaderDropdownMenu from "./HeaderDropdownMenu";
import TableControl from "./TableControl";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import SelectWithPagination from "./SelectWithPagination";

// Re-export ColPanel for backward compatibility
export { ColPanel } from "./ColPanel";

function getVal(row, accessor) {
  return accessor.split(".").reduce((o, k) => o?.[k], row);
}

// ─────────────────────────────────────────────────────────────
//  EditableCell — double-click to edit any cell in-place
//  Mirrors EditableCell.jsx from TableComponets
// ─────────────────────────────────────────────────────────────
function EditableCell({ col, row, onCellSave }) {
  const cellValue = getVal(row, col.id) ?? "";
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(cellValue));
  const inputRef = useRef(null);
  const saveHandler = col.onCellSave || onCellSave;

  useEffect(() => {
    setEditValue(String(cellValue));
  }, [cellValue]);
  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    saveHandler?.(row, col.id, editValue, cellValue);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditValue(String(cellValue));
    setIsEditing(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        title={col.isEditable ? "Double-click to edit" : undefined}
        className={`w-full min-w-0 truncate ${col.isEditable ? "cursor-pointer rounded hover:bg-blue-50/60" : ""}`}
      >
        {col.cell ? (
          col.cell(row)
        ) : (
          <span style={{ color: "#1c1f2e" }}>{String(cellValue || "")}</span>
        )}
      </div>
    );
  }

  // Custom edit component
  if (col.editComponent) {
    const EditComp = col.editComponent;
    return (
      <EditComp
        value={editValue}
        onChange={setEditValue}
        onSave={handleSave}
        onCancel={handleCancel}
        row={row}
        col={col}
        inputRef={inputRef}
      />
    );
  }

  const sharedClass =
    "w-full px-2 py-1 text-sm border border-blue-400 rounded outline-none focus:ring-1 focus:ring-blue-500";

  if (col.selectOptions?.length) {
    return (
      <select
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={sharedClass}
        autoFocus
      >
        {col.selectOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (col.textareaRows > 1) {
    return (
      <textarea
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        rows={col.textareaRows || 4}
        className={sharedClass}
        autoFocus
      />
    );
  }
  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={sharedClass}
      autoFocus
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  ResizeHandle
// ─────────────────────────────────────────────────────────────
function ResizeHandle({ colId, onResize, minWidth = 80, maxWidth = 600 }) {
  const startX = useRef(null);
  const startW = useRef(null);
  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    startX.current = e.clientX;
    startW.current = e.currentTarget
      .closest("th")
      .getBoundingClientRect().width;
    const onMove = (e) => {
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startW.current + e.clientX - startX.current),
      );
      onResize(colId, newWidth);
    };
    const onUp = () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  return (
    <span
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-0 h-full w-[12px] cursor-col-resize z-10 flex items-center justify-center group/resize"
    >
      <span className="w-[2px] h-5 bg-gray-400 rounded-full opacity-0 group-hover/resize:opacity-100 transition-opacity duration-150" />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  TruncatedHeaderName — column header name truncation with tooltip
//  Mirrors TruncatedHeaderText from TableComponets/TableHeader.jsx
// ─────────────────────────────────────────────────────────────
function TruncatedHeaderName({ name }) {
  const ref = useRef(null);
  const [truncated, setTruncated] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const check = () => {
      if (ref.current)
        setTruncated(ref.current.scrollWidth > ref.current.clientWidth);
    };
    const t = setTimeout(check, 0);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(ref.current);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [name]);

  const handleMouseEnter = (e) => {
    if (!truncated || !name) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ top: r.top - 30, left: r.left });
    setHovered(true);
  };

  return (
    <span
      ref={ref}
      className="truncate min-w-0 block"
      style={{ cursor: truncated ? "help" : undefined }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {name}
      {hovered && truncated && name && (
        <span
          className="fixed z-[99999] pointer-events-none bg-gray-900 text-white px-2 py-1 rounded-lg text-[12px] shadow-2xl"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            whiteSpace: "normal",
          }}
        >
          {name}
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  TruncatedCell — shows tooltip when text is truncated
//  Mirrors TruncatedCellText.jsx from TableComponets
// ─────────────────────────────────────────────────────────────
function TruncatedCell({ displayStr, children }) {
  const ref = useRef(null);
  const [truncated, setTruncated] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const check = () => {
      if (ref.current)
        setTruncated(ref.current.scrollWidth > ref.current.clientWidth);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [displayStr]);

  const handleMouseEnter = (e) => {
    if (!truncated || !displayStr) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ top: r.top - 32, left: r.left });
    setHovered(true);
  };

  return (
    <div
      ref={ref}
      className="truncate w-full min-w-0"
      style={{ cursor: truncated ? "help" : undefined }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && truncated && displayStr && (
        <span
          className="fixed z-[99999] pointer-events-none bg-gray-900 text-white px-2 py-1 rounded-lg text-[12px] leading-relaxed shadow-2xl max-w-xs break-words"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            whiteSpace: "normal",
          }}
        >
          {displayStr}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CellRenderer
// ─────────────────────────────────────────────────────────────
function CellRenderer({ col, row, onCellSave }) {
  if (col.isEditable)
    return <EditableCell col={col} row={row} onCellSave={onCellSave} />;

  // cellComponent pattern: col.cellComponent = ({value, row, column, onSave, cell}) => JSX
  if (col.cellComponent) {
    const CellComp = col.cellComponent;
    const value = getVal(row, col.id);
    return (
      <CellComp
        value={value}
        row={row}
        column={col}
        onSave={onCellSave}
        cell={{ value }}
      />
    );
  }

  const value = getVal(row, col.id);
  const displayStr =
    value !== null && value !== undefined ? String(value) : null;

  if (col.cell) {
    return (
      <TruncatedCell displayStr={displayStr}>{col.cell(row)}</TruncatedCell>
    );
  }

  if (!displayStr) return <span className="text-[13px] text-gray-300">—</span>;

  return (
    <TruncatedCell displayStr={displayStr}>
      <span style={{ color: "#1c1f2e" }}>{displayStr}</span>
    </TruncatedCell>
  );
}

// ─────────────────────────────────────────────────────────────
//  ColTooltip
// ─────────────────────────────────────────────────────────────
function ColTooltip({ hexColor, name, meaning, description }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const tooltipContent = description || meaning;
  if (!tooltipContent) return null;
  const show = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    let left = r.left - 8;
    if (left + 220 > window.innerWidth - 8) left = r.right - 220;
    if (left < 8) left = 8;
    setPos({ top: r.top - 35, left });
    setVisible(true);
  };
  return (
    <span className="relative flex-shrink-0 inline-flex">
      <button
        ref={btnRef}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        onClick={(e) => e.stopPropagation()}
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 cursor-pointer bg-transparent p-0 leading-none"
        style={{ border: `1.5px solid ${hexColor}55`, color: hexColor }}
      >
        i
      </button>
      {visible && (
        <span
          className="fixed z-[99999] pointer-events-none w-[220px] bg-gray-900 text-white px-2.5 py-1.5 rounded-lg leading-relaxed shadow-2xl"
          style={{
            top: pos.top,
            left: pos.left,
            wordWrap: "break-word",
            whiteSpace: "normal",
          }}
        >
          {tooltipContent}
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
//  PagBtn
// ─────────────────────────────────────────────────────────────
function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[30px] h-7 inline-flex items-center justify-center border rounded-md text-[12.5px] px-[7px] transition-all
        ${
          active
            ? "bg-blue-600 text-white border-blue-600 cursor-pointer"
            : disabled
              ? "border-gray-200 text-gray-400 bg-white cursor-not-allowed opacity-30"
              : "border-gray-200 text-gray-500 bg-white cursor-pointer hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
        }`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
//  SkeletonRow
// ─────────────────────────────────────────────────────────────
function SkeletonRow({ visibleCols, showRowNumbers }) {
  return (
    <tr>
      <td
        className="w-12 px-2 h-[38px] text-center bg-white"
        style={{
          position: "sticky",
          left: 0,
          zIndex: 3,
          boxShadow: "inset -1px 0 0 #f0f2f7",
          willChange: "transform",
        }}
      >
        <div className="h-3 bg-gray-100 rounded w-5 mx-auto animate-pulse" />
      </td>
      {showRowNumbers && (
        <td
          className="px-2 h-[38px] text-center bg-white"
          style={{
            position: "sticky",
            left: 48,
            zIndex: 2,
            willChange: "transform",
            width: 40,
            minWidth: 40,
            maxWidth: 40,
          }}
        >
          <div className="h-3 bg-gray-100 rounded w-4 mx-auto animate-pulse" />
        </td>
      )}
      {visibleCols.map((col) => (
        <td
          key={col.id}
          className={`px-3.5 h-[38px] border-b border-gray-100 ${col.pinnedRight ? "" : "border-r"}`}
          style={{ minWidth: col.width || 120 }}
        >
          <div
            className={`h-3 bg-gray-100 rounded animate-pulse ${col.pinned ? "w-40" : "w-24"}`}
          />
        </td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
const BG_HEX = {
  "bg-blue-50": "#eff6ff",
  "bg-violet-50": "#f5f3ff",
  "bg-cyan-50": "#ecfeff",
  "bg-sky-50": "#f0f9ff",
  "bg-red-50": "#fef2f2",
  "bg-pink-50": "#fdf4ff",
  "bg-orange-50": "#fff7ed",
  "bg-indigo-50": "#eef2ff",
  "bg-amber-50": "#fffbeb",
  "bg-emerald-50": "#ecfdf5",
  "bg-gray-50": "#f9fafb",
};
const getBgHex = (bgClass) => BG_HEX[bgClass] || "#f9fafb";
const STORAGE_KEY_PREFIX = "table_col_prefs_";
// WITH:
const loadColPrefs = (tableName) => {
  try {
    const s = localStorage.getItem(STORAGE_KEY_PREFIX + tableName);
    if (!s) return null;
    const parsed = JSON.parse(s);
    // Old format was a plain array — migrate it in-place immediately
    if (Array.isArray(parsed)) {
      const migrated = { columns: parsed, filters: {} };
      localStorage.setItem(
        STORAGE_KEY_PREFIX + tableName,
        JSON.stringify(migrated),
      );
      return migrated;
    }
    return parsed;
  } catch {
    return null;
  }
};
const saveColPrefs = (tableName, columns, filters = {}) => {
  try {
    localStorage.setItem(
      STORAGE_KEY_PREFIX + tableName,
      JSON.stringify({
        columns: columns.map((c) => ({
          id: c.id,
          visible: c.visible,
          pinned: c.pinned,
        })),
        filters,
      }),
    );
  } catch {}
};

function CheckboxHeader({ allSelected, onChange, indeterminate }) {
  return (
    <input
      type="checkbox"
      checked={allSelected}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate;
      }}
      onChange={(e) => onChange(e.target.checked)}
      className="cursor-pointer"
    />
  );
}
function CheckboxCell({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      className="cursor-pointer"
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function Table({
  columns: colDefs,
  defaultVisible: defaultVisibleProp,
  tableName = "default",
  group = {},
  pageIndex,
  setPageIndex,
  pageLimit,
  setPageLimit,
  paginationData,
  data,
  loading = false,
  searchInput = "",
  setSearchInput,
  sortType,
  setSortType,
  sortField,
  setSortField,
  activeFilters,
  setActiveFilters,
  additionalFilters = [],
  enableSearch = true,
  onRowClick,
  selectable = false,
  onSelectionChange,
  bulkActions = [],
  selectionToken = 0,
  onCellSave,
  additionalControls,
  additionalFilterControls,
  showRowNumbers = true,
  showPagination = true,
  showSelectColumn = true,
  showPaginationSelect = true,
  plain = false,
}) {
  // ── Selection ────────────────────────────────────────────
  const [selectedRows, setSelectedRows] = useState(new Set());
  const prevSelectionToken = useRef(selectionToken);
  useEffect(() => {
    if (selectionToken !== prevSelectionToken.current) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
      prevSelectionToken.current = selectionToken;
    }
  }, [selectionToken, onSelectionChange]);

  // ── Column header menu ────────────────────────────────────
  const [openColMenu, setOpenColMenu] = useState(null);

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = data.map((r) => r.id || r._id).filter(Boolean);
      setSelectedRows(new Set(allIds));
      onSelectionChange?.(data);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row, checked) => {
    const rowId = row.id || row._id;
    const ns = new Set(selectedRows);
    checked ? ns.add(rowId) : ns.delete(rowId);
    setSelectedRows(ns);
    onSelectionChange?.(data.filter((r) => ns.has(r.id || r._id)));
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
    onSelectionChange?.([]);
  };
  const allSelected =
    data.length > 0 && data.every((r) => selectedRows.has(r.id || r._id));
  const indeterminate =
    data.some((r) => selectedRows.has(r.id || r._id)) && !allSelected;

  // ── Column state ─────────────────────────────────────────
  const storedPrefs = useMemo(() => loadColPrefs(tableName), [tableName]);

  // const initialCols = useMemo(() => {
  //   const base = colDefs.map((c) => ({
  //     ...c,
  //     visible: defaultVisibleProp
  //       ? defaultVisibleProp.has(c.id)
  //       : (c.visible ?? true),
  //   }));
  //   if (!storedPrefs) return base;
  //   return base
  //     .sort((a, b) => {
  //       const ai = storedPrefs.findIndex((p) => p.id === a.id);
  //       const bi = storedPrefs.findIndex((p) => p.id === b.id);
  //       if (ai === -1 && bi === -1) return 0;
  //       if (ai === -1) return 1;
  //       if (bi === -1) return -1;
  //       return ai - bi;
  //     })
  //     .map((c) => {
  //       const p = storedPrefs.find((x) => x.id === c.id);
  //       return p ? { ...c, visible: p.visible, pinned: p.pinned } : c;
  //     });
  // }, [colDefs, defaultVisibleProp, storedPrefs]);

  const initialCols = useMemo(() => {
    const base = colDefs.map((c) => ({
      ...c,
      // visible = true if default, otherwise use explicit visible prop, fallback true
      visible: c.default === true ? true : (c.visible ?? true),
    }));
    if (!storedPrefs) return base;
    const storedCols = storedPrefs.columns || [];
    return base
      .sort((a, b) => {
        const ai = storedCols.findIndex((p) => p.id === a.id);
        const bi = storedCols.findIndex((p) => p.id === b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
      .map((c) => {
        const p = storedCols.find((x) => x.id === c.id);
        return p
          ? { ...c, visible: c.default ? true : p.visible, pinned: p.pinned }
          : c;
      });
  }, [colDefs, defaultVisibleProp, storedPrefs]);

  const [columns, setColumns] = useState(initialCols);
  // WITH (skip first render to avoid overwriting restored filters with {}):
  const isFirstSave = useRef(true);
  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    saveColPrefs(tableName, columns, activeFilters);
  }, [columns, tableName, activeFilters]);
  const colMenuTriggerRefs = useRef({});
  const getColMenuTriggerRef = useCallback((colId) => {
    if (!colMenuTriggerRefs.current[colId]) {
      colMenuTriggerRefs.current[colId] = React.createRef();
    }
    return colMenuTriggerRefs.current[colId];
  }, []);

  const [colWidths, setColWidths] = useState(() => {
    const widths = {};
    colDefs.forEach((col) => {
      const id = col.id || col.accessor;
      const minW = col.minWidth ?? 80;
      const saved = localStorage.getItem(`columnWidth_${id}`);
      if (saved) {
        const n = parseInt(saved, 10);
        if (!isNaN(n) && n > 0) widths[id] = Math.max(minW, n);
      }
    });
    return widths;
  });
  const visibleCols = useMemo(
    () => columns.filter((c) => c.visible),
    [columns],
  );

  const dragSrcColId = useRef(null);

  const gc = useCallback(
    (g) =>
      group[g] || { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
    [group],
  );

  const rows = data;
  const totalPages = paginationData.totalPages;
  const startRow = pageIndex * pageLimit + 1;
  const endRow = Math.min(
    (pageIndex + 1) * pageLimit,
    paginationData.totalCount,
  );

  // Same algorithm as TableComponets/TablePaginations.jsx (adapted to 0-based)
  const pagButtons = useMemo(() => {
    const MAX_VISIBLE = 8;
    const NEAR_START = 3; // 1-based threshold = 3 → 0-based < 3
    const NEAR_END = 4; // 1-based threshold = total - 4
    const BLOCK_SIZE = 4;
    if (totalPages <= MAX_VISIBLE)
      return Array.from({ length: totalPages }, (_, i) => i);
    const cur1 = pageIndex + 1; // convert to 1-based for the logic
    if (cur1 <= NEAR_START || cur1 > totalPages - NEAR_END)
      return [
        0,
        1,
        2,
        3,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
      ];
    const end1 = Math.min(cur1 + 1, totalPages - NEAR_END);
    const start1 = end1 - BLOCK_SIZE + 1;
    const block = Array.from({ length: BLOCK_SIZE }, (_, i) => start1 - 1 + i); // back to 0-based
    return [
      ...block,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
    ];
  }, [totalPages, pageIndex]);

  // Auto-back: if current page is empty but there's data in total, go back a page
  useEffect(() => {
    if (data.length === 0 && pageIndex > 0 && paginationData?.totalCount > 0) {
      setPageIndex((p) => Math.max(0, p - 1));
    }
  }, [data, pageIndex, paginationData]);

  const doSort = (id, dir) => {
    setSortField(id);
    setSortType(dir);
    setPageIndex(0);
  };

  // const toggleColVisible = (id) =>
  //   setColumns((prev) =>
  //     prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)),
  //   );

  const toggleColVisible = (id) =>
    setColumns((prev) =>
      prev.map((c) =>
        c.id === id && !c.default ? { ...c, visible: !c.visible } : c,
      ),
    );
  const toggleColPin = (id) =>
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    );
  const reorderCol = (fromId, toId) => {
    setColumns((prev) => {
      const next = [...prev];
      const fi = next.findIndex((c) => c.id === fromId);
      const ti = next.findIndex((c) => c.id === toId);
      if (fi < 0 || ti < 0) return prev;
      const [m] = next.splice(fi, 1);
      next.splice(ti, 0, m);
      return next;
    });
  };

  const getColWidth = useCallback(
    (col) => {
      const w = colWidths[col.id] || col.width || 150;
      if (col.pinnedRight) return w;
      return Math.max(col.minWidth ?? 80, w);
    },
    [colWidths],
  );
  // const colStyle = useCallback(
  //   (col) => {
  //     const w = getColWidth(col);
  //     if (col.pinnedRight) return { width: w, minWidth: w, maxWidth: w };
  //     return { width: w, minWidth: col.minWidth ?? 80, maxWidth: col.maxWidth ?? 600 };
  //   },
  //   [getColWidth]
  // );

  const colStyle = useCallback(
    (col) => {
      const w = getColWidth(col);
      if (col.pinnedRight) return { width: w, minWidth: w, maxWidth: w };
      return {
        width: w,
        minWidth: col.minWidth ?? 80,
        maxWidth: w,
        overflow: "hidden",
      };
    },
    [getColWidth],
  );

  // ── Auto-fit: measure max content width for a single column ──
  const measureColWidth = useCallback(
    (colId) => {
      const col = visibleCols.find((c) => c.id === colId);
      if (!col) return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.font = "13px Inter, ui-sans-serif, sans-serif";
      // Header text width is the minimum — row content can only grow it
      const headerTextWidth = ctx.measureText(col.name).width + 56;
      let maxWidth = headerTextWidth;
      rows.forEach((row) => {
        const value = getVal(row, col.id);
        if (value !== undefined && value !== null) {
          const w = ctx.measureText(String(value)).width + 32;
          if (w > maxWidth) maxWidth = w;
        }
      });
      const w = Math.min(
        600,
        Math.max(headerTextWidth, Math.ceil(maxWidth)) + 5,
      );
      localStorage.setItem(`columnWidth_${colId}`, String(w));
      setColWidths((prev) => ({ ...prev, [colId]: w }));
    },
    [visibleCols, rows],
  );

  // ── Auto-fit ALL columns — triggered by double-click on # header ──
  const measureAllColWidths = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = "13px Inter, ui-sans-serif, sans-serif";
    const newWidths = {};
    visibleCols.forEach((col) => {
      if (col.pinnedRight) return;
      // Header text width is the minimum — row content can only grow it
      const headerTextWidth = ctx.measureText(col.name).width + 56;
      let maxWidth = headerTextWidth;
      rows.forEach((row) => {
        const value = getVal(row, col.id);
        if (value !== undefined && value !== null) {
          const w = ctx.measureText(String(value)).width + 32;
          if (w > maxWidth) maxWidth = w;
        }
      });
      const w = Math.min(
        600,
        Math.max(headerTextWidth, Math.ceil(maxWidth)) + 5,
      );
      newWidths[col.id] = w;
      localStorage.setItem(`columnWidth_${col.id}`, String(w));
    });
    setColWidths((prev) => ({ ...prev, ...newWidths }));
  }, [visibleCols, rows]);

  // ── Sticky offsets for left-pinned columns ───────────────
  // 48px = width of the checkbox column; +40px for the # row-number column
  const ROW_NUM_COL_WIDTH = 40;
  const stickyOffsets = useMemo(() => {
    const offsets = {};
    let left = 48 + (showRowNumbers ? ROW_NUM_COL_WIDTH : 0);
    visibleCols.forEach((col) => {
      if (col.pinned && !col.pinnedRight) {
        offsets[col.id] = left;
        left += getColWidth(col);
      }
    });
    return offsets;
  }, [visibleCols, getColWidth, showRowNumbers]);

  // ─────────────────────────────────────────────────────────
  //  STICKY STYLE HELPERS
  //
  //  THE GOLDEN RULES for sticky inside overflow-x-auto:
  //
  //  1. The scroll container (overflow-x-auto div) must have NO
  //     position:relative / position:absolute. It must be either
  //     position:static (default) or removed entirely. Adding
  //     position:relative on the scroll container creates a new
  //     stacking context that breaks sticky child resolution.
  //
  //  2. Every sticky cell MUST have background set as an inline
  //     style with an explicit color — Tailwind bg-* classes work
  //     for painting but do NOT reliably cover scrolled-past content
  //     in all browsers when combined with z-index stacking.
  //
  //  3. will-change:"transform" on sticky cells hints the browser
  //     to promote them to their own GPU compositing layer, which
  //     prevents them from being scrolled away with non-sticky cells.
  //
  //  4. The <table> itself must be width:max-content (NOT width:100%)
  //     so it genuinely overflows its container and horizontal
  //     scrolling actually occurs.
  // ─────────────────────────────────────────────────────────

  // Sticky styles for <th> cells
  const stickyTh = useCallback(
    (col, bgHex) => {
      const base = { willChange: "transform" };
      if (col.pinnedRight) {
        return {
          ...base,
          position: "sticky",
          right: 0,
          zIndex: 4,
          background: bgHex || "#f9fafb",
        };
      }
      if (col.pinned) {
        return {
          ...base,
          position: "sticky",
          left: stickyOffsets[col.id] ?? 48,
          zIndex: 4,
          background: bgHex || "#f9fafb",
          boxShadow: "inset -1px 0 0 #e5e7eb",
        };
      }
      return {};
    },
    [stickyOffsets],
  );

  // Sticky styles for <td> cells
  const stickyTd = useCallback(
    (col, isSelected = false) => {
      const bg = isSelected ? "#eff6ff" : "#ffffff";
      const base = { willChange: "transform" };
      if (col.pinnedRight) {
        return {
          ...base,
          position: "sticky",
          right: 0,
          zIndex: 2,
          background: bg,
        };
      }
      if (col.pinned) {
        return {
          ...base,
          position: "sticky",
          left: stickyOffsets[col.id] ?? 48,
          zIndex: 2,
          background: bg,
          boxShadow: "inset -1px 0 0 #f0f2f7",
        };
      }
      return {};
    },
    [stickyOffsets],
  );

  // ── Header groups ────────────────────────────────────────
  const headerGroups = useMemo(() => {
    const groups = [];
    visibleCols.forEach((col) => {
      const last = groups[groups.length - 1];
      if (last && last.group === col.group) last.cols.push(col);
      else groups.push({ group: col.group, ...gc(col.group), cols: [col] });
    });
    return groups;
  }, [visibleCols, gc]);

  // Show group header row ONLY when at least one visible col has a non-empty group
  // const hasAnyGroup = useMemo(
  //   () => visibleCols.some((c) => c.group && c.group.trim() !== ""),
  //   [visibleCols],
  // );
  const hasAnyGroup = useMemo(() => {
    const realCols = visibleCols.filter((c) => !c.isFiller);
    return (
      realCols.length > 10 &&
      realCols.some((c) => c.group && c.group.trim() !== "")
    );
  }, [visibleCols]);

  // Close column header menu on any click outside
  useEffect(() => {
    const h2 = () => {
      setOpenColMenu(null);
    };
    document.addEventListener("click", h2);
    return () => {
      document.removeEventListener("click", h2);
    };
  }, []);

  // ── Shared style for the # / checkbox sticky header cell ──
  const hashHeaderStyle = {
    position: "sticky",
    left: 0,
    zIndex: 6,
    background: "#f9fafb",
    boxShadow: "inset -1px 0 0 #e5e7eb",
    willChange: "transform",
  };

  // ── Shared style for the # / checkbox sticky body cell ────
  const hashCellStyle = (isSelected) => ({
    position: "sticky",
    left: 0,
    zIndex: 3,
    background: isSelected ? "#eff6ff" : "#ffffff",
    boxShadow: "inset -1px 0 0 #f0f2f7",
    willChange: "transform",
  });

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={plain ? "" : "wrapper-table"}>
      {/* ── TableControl (toolbar + bulk bar) ── */}
      <TableControl
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        enableSearch={enableSearch}
        setPageIndex={setPageIndex}
        additionalFilters={additionalFilters}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        columns={columns}
        group={group}
        toggleColVisible={toggleColVisible}
        toggleColPin={toggleColPin}
        reorderCol={reorderCol}
        selectable={selectable}
        selectedCount={selectedRows.size}
        onClearSelection={clearSelection}
        bulkActions={bulkActions}
        additionalControls={additionalControls}
        additionalFilterControls={additionalFilterControls}
        showSelectColumn={showSelectColumn}
      />

      {/*
        ══════════════════════════════════════════════════════════
        SCROLL CONTAINER — STICKY FIX RULES (do not change):
        ══════════════════════════════════════════════════════════
        ✅ overflow-x: auto  → enables horizontal scroll
        ✅ NO position:relative / absolute / fixed on this div
           Adding any position other than static breaks sticky
           child resolution in Chrome, Safari and Firefox.
        ✅ The <table> inside is width:max-content so it genuinely
           overflows this container and scroll is triggered.
        ══════════════════════════════════════════════════════════
      */}
      <div style={{ overflowX: "auto", overflowY: "visible", width: "100%" }}>
        <table
          className="border-collapse"
          style={{
            width: "max-content",
            minWidth: "100%",
            tableLayout: "fixed",
          }}
        >
          {(loading || rows.length > 0) && (
            <thead>
              {/* GROUP HEADER ROW — only when at least one col has a group */}
              {hasAnyGroup && (
                <tr className="bg-gray-50">
                  {/* # cell spans both thead rows */}
                  <th
                    rowSpan={2}
                    onDoubleClick={measureAllColWidths}
                    title="Double-click to auto-fit all columns"
                    className="w-12 max-w-[48px] text-center px-2 text-[11px] text-gray-400 font-normal border-b border-gray-200 align-bottom cursor-pointer select-none"
                    style={{
                      ...hashHeaderStyle,
                      width: 48,
                      minWidth: 48,
                      maxWidth: 48,
                      paddingBottom: 4,
                    }}
                  >
                    {selectable ? (
                      <CheckboxHeader
                        allSelected={allSelected}
                        indeterminate={indeterminate}
                        onChange={handleSelectAll}
                      />
                    ) : (
                      <span className="text-gray-400">#</span>
                    )}
                  </th>

                  {showRowNumbers && (
                    <th
                      rowSpan={2}
                      className="text-center px-2 text-[11px] text-gray-400 font-normal border-b border-gray-200 align-bottom select-none"
                      style={{
                        position: "sticky",
                        left: 48,
                        zIndex: 3,
                        background: "#f9fafb",
                        willChange: "transform",
                        width: ROW_NUM_COL_WIDTH,
                        minWidth: ROW_NUM_COL_WIDTH,
                        maxWidth: ROW_NUM_COL_WIDTH,
                        paddingBottom: 4,
                      }}
                    >
                      <span>#</span>
                    </th>
                  )}

                  {headerGroups.map((g, gi) => {
                    const { hex, bg, text } = gc(g.group);
                    const bgHex = getBgHex(bg);
                    const pinnedCols = g.cols.filter(
                      (c) => c.pinned && !c.pinnedRight,
                    );
                    const nonPinnedCols = g.cols.filter(
                      (c) => !c.pinned && !c.pinnedRight,
                    );
                    const pinnedRightCols = g.cols.filter((c) => c.pinnedRight);
                    const hasGroup = g.group && g.group.trim() !== "";
                    const thBase =
                      "text-[11px] font-normal text-center px-2 h-[26px] whitespace-nowrap border-r border-gray-100 align-middle tracking-[.05em]";

                    const GroupLabel = () =>
                      hasGroup ? (
                        <span className="inline-flex items-center gap-1 justify-center">
                          <svg
                            width="7"
                            height="7"
                            viewBox="0 0 12 12"
                            fill={hex}
                          >
                            <circle cx="6" cy="6" r="6" />
                          </svg>
                          <span className={text}>{g.group}</span>
                        </span>
                      ) : null;

                    return (
                      <React.Fragment key={`grp-${gi}-${g.group}`}>
                        {pinnedCols.length > 0 && (
                          <th
                            colSpan={pinnedCols.length}
                            className={thBase}
                            style={{
                              position: "sticky",
                              left: stickyOffsets[pinnedCols[0].id] ?? 48,
                              zIndex: 4,
                              background: bgHex,
                              boxShadow: "inset -1px 0 0 #e5e7eb",
                              willChange: "transform",
                            }}
                            onDoubleClick={() =>
                              pinnedCols.forEach((c) => measureColWidth(c.id))
                            }
                          >
                            <GroupLabel />
                          </th>
                        )}
                        {nonPinnedCols.length > 0 && (
                          <th
                            colSpan={nonPinnedCols.length}
                            className={thBase}
                            style={{ background: bgHex }}
                            onDoubleClick={() =>
                              nonPinnedCols.forEach((c) =>
                                measureColWidth(c.id),
                              )
                            }
                          >
                            <GroupLabel />
                          </th>
                        )}
                        {pinnedRightCols.length > 0 && (
                          <th
                            colSpan={pinnedRightCols.length}
                            className={thBase}
                            style={{
                              position: "sticky",
                              right: 0,
                              zIndex: 4,
                              background: bgHex,
                              boxShadow: "inset 1px 0 0 #e5e7eb",
                              willChange: "transform",
                            }}
                          >
                            {/* {pinnedRightCols.some((c) => c.id === "actions") ? "Actions" : null} */}
                          </th>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tr>
              )}

              {/* COLUMN LABEL ROW */}
              <tr>
                {/* # cell only here when there is NO group row */}
                {!hasAnyGroup && (
                  <th
                    onDoubleClick={measureAllColWidths}
                    title="Double-click to auto-fit all columns"
                    className="w-12 max-w-[48px] text-center px-2 h-[30px] text-[11px] text-gray-400 font-normal border-b border-gray-200 align-middle cursor-pointer select-none"
                    style={{
                      ...hashHeaderStyle,
                      width: 48,
                      minWidth: 48,
                      maxWidth: 48,
                    }}
                  >
                    {selectable ? (
                      <CheckboxHeader
                        allSelected={allSelected}
                        indeterminate={indeterminate}
                        onChange={handleSelectAll}
                      />
                    ) : (
                      <span className="text-gray-400">#</span>
                    )}
                  </th>
                )}

                {/* Row-number # column header — only when no group row (group row adds it with rowSpan=2) */}
                {showRowNumbers && !hasAnyGroup && (
                  <th
                    className="text-center px-2 h-[30px] text-[11px] text-gray-400 font-normal border-b border-gray-200 align-middle select-none"
                    style={{
                      position: "sticky",
                      left: 48,
                      zIndex: 3,
                      background: "#f9fafb",
                      willChange: "transform",
                      width: ROW_NUM_COL_WIDTH,
                      minWidth: ROW_NUM_COL_WIDTH,
                      maxWidth: ROW_NUM_COL_WIDTH,
                    }}
                  >
                    <span>#</span>
                  </th>
                )}

                {visibleCols.map((col) => {
                  const { hex, bg } = gc(col.group);
                  const bgHex = getBgHex(bg);
                  const menuOpen = openColMenu === col.id;

                  if (col.pinnedRight) {
                    return (
                      <th
                        key={col.id}
                        className="border-b border-gray-200 relative px-3 h-[30px] text-[11px] font-normal text-gray-500 whitespace-nowrap text-center"
                        style={{
                          ...colStyle(col),
                          ...stickyTh(col, "#f9fafb"),
                          boxShadow: "inset 1px 0 0 #e5e7eb",
                        }}
                      >
                        {col.id === "actions" ? "Actions" : null}
                      </th>
                    );
                  }

                  return (
                    <th
                      key={col.id}
                      ref={getColMenuTriggerRef(col.id)}
                      data-col-id={col.id}
                      title="Double-click to auto-fit this column"
                      draggable
                      onDragStart={(e) => {
                        dragSrcColId.current = col.id;
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", col.id);
                        e.currentTarget.style.opacity = "0.5";
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = "";
                        e.currentTarget.style.outline = "";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        e.currentTarget.style.outline = "2px solid #3b82f6";
                        e.currentTarget.style.outlineOffset = "-2px";
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.outline = "";
                        e.currentTarget.style.outlineOffset = "";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.style.outline = "";
                        e.currentTarget.style.outlineOffset = "";
                        const fromId =
                          dragSrcColId.current ||
                          e.dataTransfer.getData("text/plain");
                        dragSrcColId.current = null;
                        if (fromId && fromId !== col.id)
                          reorderCol(fromId, col.id);
                      }}
                      className={`table-col-label ${bg} px-3 h-[30px] text-[11px] font-normal text-gray-500 whitespace-nowrap tracking-[.03em] cursor-pointer select-none ${col.pinned ? "" : "border-r"} border-b ${hasAnyGroup ? "border-t" : ""} border-gray-200 relative`}
                      style={{
                        ...colStyle(col),
                        ...stickyTh(col, bgHex),
                        textAlign: "left",
                      }}
                      onDoubleClick={() => measureColWidth(col.id)}
                    >
                      <div className="group relative flex items-center gap-1 min-w-0 w-full">
                        <div
                          title="Drag to reorder"
                          className="flex flex-col gap-[2px] flex-shrink-0 cursor-grab opacity-30 group-hover:opacity-80 transition-opacity"
                        >
                          {[0, 1, 2].map((r) => (
                            <div key={r} className="flex gap-[2px]">
                              <span className="block w-[2px] h-[2px] bg-gray-500 rounded-full" />
                              <span className="block w-[2px] h-[2px] bg-gray-500 rounded-full" />
                            </div>
                          ))}
                        </div>
                        <ColTooltip
                          hexColor={hex}
                          name={col.name}
                          meaning={col.group}
                          description={col.description}
                        />
                        <div className="flex-1 min-w-0">
                          {col.header ? (
                            typeof col.header === "function" ? (
                              col.header(col)
                            ) : (
                              col.header
                            )
                          ) : (
                            <TruncatedHeaderName name={col.name} />
                          )}
                        </div>
                        {sortField === col.id ? (
                          <span
                            className="flex-shrink-0 flex items-center"
                            style={{ color: hex }}
                          >
                            {sortType === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )}
                          </span>
                        ) : !col.disableSortBy ? (
                          <span
                            className="flex-shrink-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ minWidth: 16, minHeight: 16 }}
                          >
                            {/* <svg id={`col-sort-icon-${col.id}`} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700">
                              <path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                            </svg> */}
                          </span>
                        ) : null}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenColMenu(menuOpen ? null : col.id);
                          }}
                          className={`flex-shrink-0 inline-flex flex-col items-center justify-center w-3.5 h-3.5 rounded-full border cursor-pointer ml-1 p-0 transition-all
                            ${menuOpen ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-300 bg-transparent text-gray-400 hover:border-blue-600 hover:text-blue-600"}`}
                        >
                          <svg
                            width="7"
                            height="7"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                          <svg
                            width="7"
                            height="7"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </div>

                      <HeaderDropdownMenu
                        col={col}
                        isOpen={menuOpen}
                        triggerRef={getColMenuTriggerRef(col.id)}
                        onClose={() => setOpenColMenu(null)}
                        onSortAsc={() => doSort(col.id, "asc")}
                        onSortDesc={() => doSort(col.id, "desc")}
                        onPin={() => toggleColPin(col.id)}
                        onHide={() => toggleColVisible(col.id)}
                        totalColumns={columns.length}
                      />

                      <ResizeHandle
                        colId={col.id}
                        onResize={(id, w) => {
                          localStorage.setItem(`columnWidth_${id}`, String(w));
                          setColWidths((prev) => ({ ...prev, [id]: w }));
                        }}
                        minWidth={col.minWidth ?? 80}
                        maxWidth={col.maxWidth ?? 600}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
          )}

          <tbody>
            {loading ? (
              Array.from({ length: pageLimit }).map((_, i) => (
                <SkeletonRow
                  key={i}
                  visibleCols={visibleCols}
                  showRowNumbers={showRowNumbers}
                />
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length + 1 + (showRowNumbers ? 1 : 0)}>
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                      </svg>
                    </div>
                    <p className="text-[15px] font-medium text-gray-600 mb-1">
                      No results found
                    </p>
                    <p className="text-[13px] text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const isSelected = selectedRows.has(row.id || row._id);
                return (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 transition-colors cursor-pointer"
                    style={{
                      borderLeft: "3px solid transparent",
                      background: isSelected ? "#eff6ff" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#f5f7ff";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "";
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {/* checkbox — always sticky left:0 */}
                    <td
                      className="w-12 max-w-[48px] text-center px-2 h-[38px]"
                      style={{
                        ...hashCellStyle(isSelected),
                        width: 48,
                        minWidth: 48,
                        maxWidth: 48,
                      }}
                    >
                      {selectable ? (
                        <CheckboxCell
                          checked={isSelected}
                          onChange={(checked) => handleSelectRow(row, checked)}
                        />
                      ) : (
                        <span className="text-xs text-gray-500 font-mono">
                          {startRow + idx}
                        </span>
                      )}
                    </td>

                    {/* Row number # cell */}
                    {showRowNumbers && (
                      <td
                        className="text-center px-2 h-[38px] text-xs text-gray-400 font-mono"
                        style={{
                          position: "sticky",
                          left: 48,
                          zIndex: 2,
                          background: isSelected ? "#eff6ff" : "#ffffff",
                          willChange: "transform",
                          width: ROW_NUM_COL_WIDTH,
                          minWidth: ROW_NUM_COL_WIDTH,
                          maxWidth: ROW_NUM_COL_WIDTH,
                        }}
                      >
                        {startRow + idx}
                      </td>
                    )}

                    {visibleCols.map((col) => (
                      <td
                        key={col.id}
                        className={`px-3.5 h-[38px] text-[13px] align-middle whitespace-nowrap overflow-hidden text-ellipsis border-b border-gray-100 ${col.pinnedRight || col.pinned ? "" : "border-r"}`}
                        style={{
                          ...colStyle(col),
                          ...stickyTd(col, isSelected),
                        }}
                      >
                        <CellRenderer
                          col={col}
                          row={row}
                          onCellSave={onCellSave}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {rows.length > 0 && showPagination && (
        <div className="table-pagination">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2 sm:gap-4 text-[13px] text-gray-500">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <div className="sm:hidden">
                {loading
                  ? "Loading…"
                  : `${startRow?.toLocaleString()}-${endRow?.toLocaleString()} of ${paginationData?.totalCount?.toLocaleString()}`}
              </div>
              <div className="hidden sm:block">
                {loading
                  ? "Loading…"
                  : `${startRow?.toLocaleString()} to ${endRow?.toLocaleString()} of ${paginationData?.totalCount?.toLocaleString()} results`}
              </div>
              {(paginationData?.totalCount ?? 0) > 10 && (
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline text-[12px] text-gray-400">
                    Rows:
                  </span>
                  <SelectWithPagination
                    limit={pageLimit}
                    setLimit={setPageLimit}
                    setPageIndex={setPageIndex}
                    totalRecords={paginationData?.totalCount || 0}
                    tableName={tableName}
                    openUpward={true}
                  />
                </div>
              )}
            </div>
            {(paginationData?.totalCount ?? 0) > 10 && showPaginationSelect && (
              <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
                <PagBtn
                  onClick={() => setPageIndex(0)}
                  disabled={pageIndex === 0}
                >
                  <ChevronsLeft className="w-3 h-3" />
                </PagBtn>
                <PagBtn
                  onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="w-3 h-3" />
                </PagBtn>
                {pagButtons.map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-gray-500 text-[13px] flex items-center"
                    >
                      …
                    </span>
                  ) : (
                    <PagBtn
                      key={p}
                      onClick={() => setPageIndex(p)}
                      active={pageIndex === p}
                    >
                      {p + 1}
                    </PagBtn>
                  ),
                )}
                <PagBtn
                  onClick={() =>
                    setPageIndex(Math.min(totalPages - 1, pageIndex + 1))
                  }
                  disabled={pageIndex === totalPages - 1}
                >
                  <ChevronRight className="w-3 h-3" />
                </PagBtn>
                <PagBtn
                  onClick={() => setPageIndex(totalPages - 1)}
                  disabled={pageIndex === totalPages - 1}
                >
                  <ChevronsRight className="w-3 h-3" />
                </PagBtn>
              </div>
            )}
            {(paginationData?.totalCount ?? 0) > 10 && showPaginationSelect && (
              <div className="flex sm:hidden items-center justify-center gap-2">
                <PagBtn
                  onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                  disabled={pageIndex === 0}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </PagBtn>
                <span className="text-[12px] text-gray-600 min-w-[60px] text-center font-medium">
                  {pageIndex + 1} / {totalPages}
                </span>
                <PagBtn
                  onClick={() =>
                    setPageIndex(Math.min(totalPages - 1, pageIndex + 1))
                  }
                  disabled={pageIndex === totalPages - 1}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </PagBtn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
