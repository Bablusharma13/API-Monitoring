/**
 * NewTableConfig — wrapper around the new Table.jsx component.
 *
 * Accepts the SAME props as the old TableConfig so pages only need to
 * swap the import path. Internally it:
 *
 *  1. Converts react-table column format { accessor, Header, Cell } to
 *     the new format { id, name, cell, visible, pinned, group, ... }
 *
 *  2. Converts 1-based pagination (old API) ↔ 0-based pageIndex (Table.jsx)
 *
 *  3. Bridges handleServerSideSorting with Table.jsx's sortField/sortType
 *
 *  4. Passes search inside Table.jsx's own toolbar (not outside)
 *
 *  5. Converts availableAdditionalFilters (old multi-select array format)
 *     into Table.jsx's additionalFilters (single-select pill format)
 *
 *  6. Injects an Actions column using the ORIGINAL ActionDropdown component
 *
 * Props (identical to old TableConfig):
 *   columns, data, module, isLoading,
 *   totalPages, currentPage, setCurrentPage,
 *   pageLimit, handlePageLimitChange, totalResults,
 *   sortBy, sortOrder, handleServerSideSorting,
 *   handleHideColumn, updateSelectedRows,
 *   isAction, actions, isDraft, isTrash, handleRestore, onCellSave,
 *   group, onRowClick
 *
 * EXTRA props (new — go into Table.jsx's toolbar, NOT into a separate control bar):
 *   searchQuery, onSearchChange    ← puts search INSIDE the toolbar
 *   availableAdditionalFilters     ← converts to Table.jsx filter pills
 *   hasActiveFilters, onClearFilters
 */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { Eye, Pencil, Trash2, Trash, RotateCcw } from "lucide-react";
import { Table } from "./Table.jsx";

// ─── Inline action dropdown (replaces missing ActionDropdown) ──
// Uses createPortal + position:absolute so it escapes will-change:transform
// on sticky td cells (which would break position:fixed child positioning).
function RowActions({ row, actions = {}, isTrash, handleRestore }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [];
  if (isTrash) {
    if (actions.onView)
      items.push({
        label: "View",
        icon: <Eye className="w-3.5 h-3.5" />,
        view: true,
        onClick: () => actions.onView(row),
      });
  }
  if (handleRestore)
    items.push({
      label: "Restore",
      icon: <RotateCcw className="w-3.5 h-3.5" />,
      restore: true,
      onClick: () => handleRestore(row),
    });
  if (actions.onPermanentDelete)
    items.push({
      label: "Delete Permanently",
      icon: <Trash2 className="w-3.5 h-3.5" />,
      danger: true,
      onClick: () => actions.onPermanentDelete(row),
    });
  else {
    if (actions.onView)
      items.push({
        label: "View",
        icon: <Eye className="w-3.5 h-3.5" />,
        view: true,
        onClick: () => actions.onView(row),
      });
    if (actions.onEdit)
      items.push({
        label: "Edit",
        icon: <Pencil className="w-3.5 h-3.5" />,
        edit: true,
        onClick: () => actions.onEdit(row),
      });
    if (actions.onDelete)
      items.push({
        label: "Delete",
        icon: <Trash2 className="w-3.5 h-3.5" />,
        danger: true,
        onClick: () => actions.onDelete(row),
      });
    if (actions.onTrash)
      items.push({
        label: "Move to Trash",
        icon: <Trash className="w-3.5 h-3.5" />,
        warning: true,
        onClick: () => actions.onTrash(row),
      });
  }

  if (!items.length) return null;

  return (
    <div className="flex justify-end pr-1" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setPos({
              top: r.bottom + window.scrollY + 4,
              left: r.right + window.scrollX,
            });
          }
          setOpen((v) => !v);
        }}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-transparent text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              transform: "translateX(-100%)",
              zIndex: 99999,
            }}
            className="min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                // className={`flex items-center gap-2 px-3.5 py-2.5 text-[13px] cursor-pointer transition-colors ${
                //   item.danger
                //     ? "text-red-600 hover:bg-red-50"
                //     : "text-gray-800 hover:bg-gray-50"
                // }`}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-[13px] cursor-pointer transition-colors ${
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : item.warning
                      ? "text-orange-600 hover:bg-orange-50"
                      : item.edit
                        ? "text-green-600 hover:bg-green-50"
                        : item.view
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

// ─── Column converter: react-table → Table.jsx format ─────────
function normaliseColumns({
  columns,
  isAction,
  actions,
  handleRestore,
  isTrash,
}) {
  const result = [];

  columns.forEach((col) => {
    // Skip columns that the old system generates internally
    if (col.id === "actions" || col.id === "dragHandle") return;

    const id = col.accessor || col.id || "";
    const name =
      typeof col.Header === "string"
        ? col.Header
        : typeof col.name === "string"
          ? col.name
          : id;

    // Build the cell renderer — wraps old Cell format
    let cellFn;
    if (col.cell) {
      // Already new format
      cellFn = col.cell;
    } else if (col.Cell) {
      // Old react-table Cell: ({ row, value }) => JSX
      // Table.jsx calls cell(rowData) where rowData is the raw object
      cellFn = (rowData) => {
        const value = id.split(".").reduce((o, k) => o?.[k], rowData);
        // Construct a row-like object compatible with old Cell components
        const fakeRow = {
          original: rowData,
          values: rowData,
          id: rowData.id || rowData._id,
        };
        return col.Cell({ row: fakeRow, value, cell: { value } });
      };
    }

    result.push({
      ...col,
      id,
      name,
      cell: cellFn,
      visible: col.visible ?? true,
      pinned: col.pinned ?? (col.sticky === true && col.position === "left"),
      pinnedRight:
        col.pinnedRight ?? (col.sticky === true && col.position === "right"),
      group: col.group || "",
      description: col.description || "",
      width: col.width || 150,
      disableSortBy: col.disableSortBy ?? false,
    });
  });

  // Inject Actions column at the end using original ActionDropdown
  if (isAction) {
    result.push({
      id: "actions",
      name: "",
      pinnedRight: true,
      visible: true,
      pinned: false,
      group: "",
      width: 56,
      description: "",
      cell: (rowData) => (
        <RowActions
          row={rowData}
          actions={actions || {}}
          handleRestore={handleRestore}
          isTrash={isTrash}
        />
      ),
    });
  }

  return result;
}

// ─── Filter converter: availableAdditionalFilters → additionalFilters ─
// Old format:
//   [{ id, props: { filterHeading, options, handleFilter, filterName, selectedOptions, clearFilter } }]
// Table.jsx format:
//   [{ id, name, filterName, options: [{ value, label }], icon }]
function normaliseFilters(availableAdditionalFilters = []) {
  return availableAdditionalFilters.map((f) => {
    const p = f.props || f;
    return {
      id: f.id,
      name: p.filterHeading || p.filterName || f.id,
      filterName: p.filterName || f.id,
      options: (p.options || []).map((o) => ({
        value: o.value ?? o._id ?? String(o.label),
        label: o.label ?? o.name ?? String(o.value),
      })),
    };
  });
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function TableConfig({
  // Old TableConfig props
  columns: rawColumns = [],
  data = [],
  module = "default",
  isLoading = false,
  totalPages = 1,
  currentPage = 1, // 1-based (old API)
  setCurrentPage,
  pageLimit = 10,
  handlePageLimitChange,
  totalResults = 0,
  sortBy: sortByProp = "",
  sortOrder: sortOrderProp = "asc",
  handleServerSideSorting,
  handleHideColumn,
  updateSelectedRows,
  isAction = false,
  actions = {},
  isDraft = false,
  isTrash = false,
  handleRestore,
  onCellSave,
  group = {},
  onRowClick,

  // New — search goes INSIDE Table.jsx's toolbar
  searchQuery,
  onSearchChange,

  // New — filters go INSIDE Table.jsx's toolbar (converted to single-select pills)
  availableAdditionalFilters = [],
  hasActiveFilters = false,
  onClearFilters,
  onFiltersChange,

  // Bulk actions passed through to Table.jsx's BulkActionBar
  bulkActions = [],
  selectionToken = 0,
  additionalFilterControls,
  showRowNumbers,
  showPagination,
  showSelectColumn = true,
  showPaginationSelect = true,
  plain = false,
}) {
  // ── Pagination: convert 1-based → 0-based for Table.jsx ───
  const pageIndex = Math.max(0, (currentPage || 1) - 1);
  const handleSetPageIndex = useCallback(
    (p) => {
      // Table.jsx calls setPageIndex with 0-based index
      setCurrentPage?.(p + 1);
    },
    [setCurrentPage],
  );
  const handleSetPageLimit = useCallback(
    (limit) => {
      handlePageLimitChange?.(limit);
      setCurrentPage?.(1);
    },
    [handlePageLimitChange, setCurrentPage],
  );

  // ── Search state: bridge external searchQuery → Table.jsx ──
  const [searchInput, setSearchInput] = useState(searchQuery || "");
  useEffect(() => {
    setSearchInput(searchQuery || "");
  }, [searchQuery]);
  const handleSearchChange = useCallback(
    (val) => {
      setSearchInput(val);
      onSearchChange?.(val);
    },
    [onSearchChange],
  );

  // ── Sort state: bridge external sort → Table.jsx ──────────
  const [sortField, setSortField] = useState(sortByProp || "");
  const [sortType, setSortType] = useState(
    sortOrderProp === "desc" ? "desc" : "asc",
  );

  useEffect(() => {
    setSortField(sortByProp || "");
  }, [sortByProp]);
  useEffect(() => {
    setSortType(sortOrderProp === "desc" ? "desc" : "asc");
  }, [sortOrderProp]);
  // ✅ REPLACE with:

  const handleSetSortField = useCallback((field) => {
    setSortField(field);
  }, []);

  const handleSetSortType = useCallback((type) => {
    setSortType(type);
  }, []);

  // Fires ONCE after both sortField + sortType are committed to state
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!sortField) return;
    handleServerSideSorting?.({ sortBy: sortField, sortDirection: sortType });
    setCurrentPage?.(1);
  }, [sortField, sortType]);

  // ── Filters: convert old format → Table.jsx additionalFilters ──
  // const [activeFilters, setActiveFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState(() => {
    try {
      const s = localStorage.getItem("table_col_prefs_" + module);
      if (!s) return {};
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return {};
      return parsed.filters || {};
    } catch {
      return {};
    }
  });
  const additionalFilters = useMemo(
    () => normaliseFilters(availableAdditionalFilters),
    [availableAdditionalFilters],
  );

  // ADD this after the activeFilters useState and additionalFilters useMemo:

  const isFirstFilterSync = useRef(true);
  useEffect(() => {
    if (!isFirstFilterSync.current) return;
    if (Object.keys(activeFilters).length === 0) return;
    isFirstFilterSync.current = false;

    // Fire the old handleFilter callbacks for every restored filter
    Object.entries(activeFilters).forEach(([filterName, value]) => {
      const filterDef = availableAdditionalFilters.find(
        (f) => (f.props?.filterName || f.id) === filterName,
      );
      if (filterDef?.props?.handleFilter) {
        filterDef.props.handleFilter({
          value: [{ value, label: value }],
          label: filterName,
        });
      }
    });
  }, [availableAdditionalFilters]); // fires once when filter defs are ready

  // Sync Table.jsx activeFilters back to old handleFilter callbacks
  const handleSetActiveFilters = useCallback(
    (updater) => {
      setActiveFilters((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        // Call old handleFilter callbacks for changed keys
        Object.entries(next).forEach(([filterName, value]) => {
          const filterDef = availableAdditionalFilters.find(
            (f) => (f.props?.filterName || f.id) === filterName,
          );
          if (filterDef?.props?.handleFilter) {
            filterDef.props.handleFilter({
              value: [{ value, label: value }],
              label: filterName,
            });
          }
        });
        // Handle cleared keys
        Object.keys(prev).forEach((filterName) => {
          if (!(filterName in next)) {
            const filterDef = availableAdditionalFilters.find(
              (f) => (f.props?.filterName || f.id) === filterName,
            );
            filterDef?.props?.clearFilter?.();
          }
        });
        onFiltersChange?.(next);
        return next;
      });
    },
    [availableAdditionalFilters, onFiltersChange],
  );

  // ── Column conversion ──────────────────────────────────────
  const normalisedColumns = useMemo(
    () =>
      normaliseColumns({
        columns: rawColumns,
        isAction,
        actions,
        handleRestore,
        isTrash,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawColumns, isAction, isTrash],
  );

  // ── Selection ──────────────────────────────────────────────
  const handleSelectionChange = useCallback(
    (selectedData) => updateSelectedRows?.(selectedData),
    [updateSelectedRows],
  );

  return (
    <Table
      columns={normalisedColumns}
      tableName={module}
      group={group}
      pageIndex={pageIndex}
      setPageIndex={handleSetPageIndex}
      pageLimit={pageLimit}
      setPageLimit={handleSetPageLimit}
      paginationData={{ totalCount: totalResults, totalPages }}
      data={data}
      loading={isLoading}
      enableSearch={!!onSearchChange}
      searchInput={searchInput}
      setSearchInput={handleSearchChange}
      sortType={sortType}
      setSortType={handleSetSortType}
      sortField={sortField}
      setSortField={handleSetSortField}
      activeFilters={activeFilters}
      setActiveFilters={handleSetActiveFilters}
      additionalFilters={additionalFilters}
      selectable={!!updateSelectedRows}
      onSelectionChange={handleSelectionChange}
      bulkActions={bulkActions}
      selectionToken={selectionToken}
      onCellSave={onCellSave}
      onRowClick={onRowClick}
      additionalFilterControls={additionalFilterControls}
      showRowNumbers={showRowNumbers}
      showPagination={showPagination}
      showSelectColumn={showSelectColumn}
      showPaginationSelect={showPaginationSelect}
      plain={plain}
    />
  );
}
