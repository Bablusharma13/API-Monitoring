/**
 * TableControl
 * Mirrors the role of FriendTableComponets/ReusableTableControl.jsx
 * for the TableComponents/Table.jsx table system.
 *
 * Contains: search bar, filter pills, "Add Filter" button,
 *           optional extra filter-row buttons (additionalFilterControls),
 *           "Select Columns" button + ColPanel, and bulk action bar.
 *
 * Design is 100% identical to what was inlined in Table.jsx — nothing changed.
 */
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Search, X, Plus, Check, ChevronDown } from "lucide-react";
import { ColPanel } from "./ColPanel";
import PortalWrapper from "./PortalWrapper";
import { ActionButton } from "../ui/ActionButton";

// ─────────────────────────────────────────────────────────────
//  FilterPill  — supports multiSelect (default true) per filter
//
//  filter.multiSelect !== false  → multi-select mode
//    • values stored as comma-joined string "a,b,c"
//    • dropdown stays open on pick; shows checkboxes
//  filter.multiSelect === false  → single-select (original behaviour)
// ─────────────────────────────────────────────────────────────
function FilterPill({
  filter,
  selected,
  ddOpen,
  q,
  opts,
  activeFilters,
  selKey,
  onOpen,
  onClear,
  onSearch,
  onPick,
  onClose,
}) {
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rafRef = useRef(null);

  const isMulti = filter.multiSelect !== false;

  // For multi-select, `selected` is a comma-string; derive an array for easy lookups
  const selectedArr = isMulti && selected ? selected.split(",") : [];
  const isAnySelected = isMulti ? selectedArr.length > 0 : !!selected;

  // Label shown inside the pill button
  let pillLabel;
  if (isMulti) {
    if (selectedArr.length === 0) {
      pillLabel = filter.name;
    } else if (selectedArr.length === 1) {
      pillLabel =
        filter.options.find((o) => o.value === selectedArr[0])?.label ??
        selectedArr[0];
    } else {
      pillLabel = `${selectedArr.length} selected`;
    }
  } else {
    pillLabel = selected
      ? (filter.options.find((o) => o.value === selected)?.label ?? selected)
      : filter.name;
  }

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
  }, []);

  useEffect(() => {
    if (!ddOpen) return;
    const handleOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handleOutside),
      80,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [ddOpen, onClose]);

  useEffect(() => {
    if (ddOpen) rafRef.current = requestAnimationFrame(updatePos);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ddOpen, updatePos]);

  useEffect(() => {
    if (!ddOpen) return;
    const fn = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePos);
    };
    window.addEventListener("scroll", fn, true);
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn, true);
      window.removeEventListener("resize", fn);
      cancelAnimationFrame(rafRef.current);
    };
  }, [ddOpen, updatePos]);

  const active = isAnySelected || ddOpen;
  return (
    <div className="relative flex-shrink-0">
      <button
        ref={btnRef}
        onClick={() => {
          updatePos();
          onOpen();
        }}
        className={`inline-flex items-center gap-1 px-3 py-[6px] h-[30px] border rounded-full text-[12.5px] cursor-pointer transition-all whitespace-nowrap select-none
          ${active ? "border-blue-600 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500 bg-white hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"}`}
      >
        {filter.icon}
        <span>{pillLabel}</span>
        {isAnySelected ? (
          <span onClick={onClear} className="flex">
            <X className="w-2.5 h-2.5" />
          </span>
        ) : (
          <ChevronDown className="w-2.5 h-2.5" />
        )}
      </button>
      {ddOpen && (
        <div
          ref={menuRef}
          className="fixed min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[99999] overflow-hidden"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="px-3 py-2.5 border-b border-gray-200">
            <input
              autoFocus
              type="text"
              placeholder={`Search ${filter.name.toLowerCase()}…`}
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full border border-gray-200 rounded-md px-2.5 py-[7px] text-[13px] outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto">
            {opts.map((opt) => {
              const isOptSelected = isMulti
                ? selectedArr.includes(opt.value)
                : activeFilters[selKey] === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => onPick(opt.value)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[13px] cursor-pointer transition-colors ${isOptSelected ? "bg-blue-50 text-blue-600" : "text-gray-800 hover:bg-gray-50"}`}
                >
                  {opt.flag && (
                    <img
                      src={`/flags/${opt.flag.toUpperCase()}.png`}
                      alt=""
                      className="w-5 h-[14px] object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  {opt.label}
                  {isOptSelected && <Check className="w-3 h-3 ml-auto" />}
                </div>
              );
            })}
            {opts.length === 0 && (
              <div className="px-3.5 py-3 text-[13px] text-gray-400">
                No results
              </div>
            )}
          </div>
          {isAnySelected && (
            <>
              <div className="h-px bg-gray-100" />
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onClear(e);
                }}
                className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-red-500 cursor-pointer hover:bg-red-50 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear filter
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  AddFilterButton  (exact copy from Table.jsx — design unchanged)
// ─────────────────────────────────────────────────────────────
function AddFilterButton({
  additionalFilters,
  activeFilterIds,
  addFilterOpen,
  onToggle,
  onToggleFilter,
  activeFilters,
  onClose,
  onClearAllFilters,
}) {
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rafRef = useRef(null);

  const updatePos = useCallback(() => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
  }, []);

  useEffect(() => {
    if (!addFilterOpen) return;
    const handleOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        onClose?.();
      }
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handleOutside),
      80,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [addFilterOpen, onClose]);
  useEffect(() => {
    if (!addFilterOpen) return;
    const fn = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePos);
    };
    window.addEventListener("scroll", fn, true);
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn, true);
      window.removeEventListener("resize", fn);
      cancelAnimationFrame(rafRef.current);
    };
  }, [addFilterOpen, updatePos]);

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={btnRef}
        onClick={() => {
          updatePos();
          onToggle();
        }}
        className="inline-flex items-center gap-1 px-3 py-[4px] h-[30px] border border-dashed border-gray-400 rounded-full text-[12px] text-gray-500 cursor-pointer bg-transparent transition-all whitespace-nowrap hover:border-blue-600 hover:text-blue-600"
      >
        <Plus className="w-[11px] h-[11px]" /> Add Filter
      </button>
      {/* {addFilterOpen && (
        <div
          ref={menuRef} // ← add
          className="fixed min-w-[210px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[99999] overflow-hidden"
          style={{ top: pos.top, left: pos.left }}
        >
          {additionalFilters.map((f) => (
            <div
              key={f.id}
              onClick={() => onToggleFilter(f.id)}
              className="flex items-center gap-2 px-3.5 py-[5px] text-[13px] text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {f.icon}
                {f.name}
              </span>
              {activeFilterIds.includes(f.id) && (
                <Check className="w-3 h-3 text-blue-600 ml-auto" />
              )}
            </div>
          ))}
        </div>
      )} */}
      {addFilterOpen && (
        <div
          ref={menuRef}
          className="fixed min-w-[210px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[99999] overflow-hidden"
          style={{ top: pos.top, left: pos.left }}
        >
          {/* Filter list */}
          {additionalFilters.map((f) => (
            <div
              key={f.id}
              onClick={() => onToggleFilter(f.id)}
              className="flex items-center gap-2 px-3.5 py-[5px] text-[13px] text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {f.icon}
                {f.name}
              </span>
              {activeFilterIds.includes(f.id) && (
                <Check className="w-3 h-3 text-blue-600 ml-auto" />
              )}
            </div>
          ))}

          {/* 🔥 Clear Filters option */}
          {Object.keys(activeFilters).length > 0 && (
            <>
              <div className="h-px bg-gray-100 my-1" />
              <div
                onClick={() => {
                  onClearAllFilters();
                  onClose?.();
                }}
                className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-red-500 cursor-pointer hover:bg-red-50 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  BulkActionBar  (exact copy from Table.jsx — design unchanged)
// ─────────────────────────────────────────────────────────────
function BulkActionBar({ count, onClear, actions = [] }) {
  if (!actions.length) return null;
  return (
    <div
      className="px-4 border-b border-blue-100 py-2 flex items-center gap-2 flex-wrap"
      style={{ background: "#eff6ff", animation: "bulkSlideIn 0.15s ease" }}
    >
      <style>{`@keyframes bulkSlideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="flex items-center gap-2 w-full">
        <span className="inline-flex items-center justify-center text-[11px] text-blue-500 flex-shrink-0">
          {count} selected
        </span>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 flex-wrap">
            {actions.map((btn, idx) => (
              <ActionButton
                key={btn.action || idx}
                action={btn.action}
                onClick={btn.onClick}
              />
            ))}
          </div>
          <ActionButton action="clear" onClick={() => onClear()} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  TableControl — main export
//
//  Props (mirrors ReusableTableControl naming):
//
//  searchInput              string   – controlled search value
//  setSearchInput           fn       – setter for search value
//  enableSearch             bool     – show/hide search bar (default true)
//  setPageIndex             fn       – reset page on search/filter change
//
//  additionalFilters        array    – filter definitions (same shape as Table.jsx)
//  activeFilters            object   – current filter values
//  setActiveFilters         fn       – setter
//
//  columns                  array    – column defs (for ColPanel)
//  group                    object   – group colour config (for ColPanel)
//  toggleColVisible         fn
//  toggleColPin             fn
//  reorderCol               fn
//
//  selectable               bool     – enable bulk mode
//  selectedCount            number   – number of selected rows
//  onClearSelection         fn       – clear selection callback
//  bulkActions              array    – same shape as Table.jsx bulkActions
//
//  additionalFilterControls node     – extra buttons rendered RIGHT AFTER
//                                      the "Add Filter" button (filter row)
//
//  additionalControls       node     – extra buttons/controls rendered on the
//                                      RIGHT side, before "Select Columns"
// ─────────────────────────────────────────────────────────────
const TableControl = memo(
  ({
    // Search
    searchInput = "",
    setSearchInput,
    enableSearch = true,
    setPageIndex,

    // Filters
    additionalFilters = [],
    activeFilters = {},
    setActiveFilters,

    // Column panel
    columns = [],
    group = {},
    toggleColVisible,
    toggleColPin,
    reorderCol,

    // Bulk selection
    selectable = false,
    selectedCount = 0,
    onClearSelection,
    bulkActions = [],

    // ✅ NEW: Extra buttons rendered RIGHT AFTER the "Add Filter" button (left/filter row)
    additionalFilterControls,

    // Extra slot (right side, before "Select Columns")
    additionalControls,

    showSelectColumn,
  }) => {
    // ── Internal UI state (was scattered in Table.jsx) ──────
    // const [activeFilterIds, setActiveFilterIds] = useState([]);
    // WITH:
    const [activeFilterIds, setActiveFilterIds] = useState(() =>
      additionalFilters
        .filter((f) => !!activeFilters[f.filterName || f.id])
        .map((f) => f.id),
    );

    const [openDD, setOpenDD] = useState(null);
    const [addFilterOpen, setAddFilterOpen] = useState(false);
    const [ddSearch, setDdSearch] = useState({});
    const [colPanelOpen, setColPanelOpen] = useState(false);
    const [colPanelPos, setColPanelPos] = useState({ top: 0, left: 0 });
    const toolbarRef = useRef(null);
    const colBtnRef = useRef(null);
    const colPanelRef = useRef(null);

    const updateColPanelPos = useCallback(() => {
      if (colBtnRef.current) {
        const r = colBtnRef.current.getBoundingClientRect();
        setColPanelPos({ top: r.bottom + 8, left: r.right - 320 });
      }
    }, []);

    // Keep ColPanel anchored to the button on scroll / resize (sync, no RAF to avoid lag)
    useEffect(() => {
      if (!colPanelOpen) return;
      window.addEventListener("scroll", updateColPanelPos, true);
      window.addEventListener("resize", updateColPanelPos);
      return () => {
        window.removeEventListener("scroll", updateColPanelPos, true);
        window.removeEventListener("resize", updateColPanelPos);
      };
    }, [colPanelOpen, updateColPanelPos]);

    // Close all panels on outside click — also exclude the portal ColPanel
    useEffect(() => {
      const h = (e) => {
        if (
          !toolbarRef.current?.contains(e.target) &&
          !colPanelRef.current?.contains(e.target)
        ) {
          setOpenDD(null);
          setColPanelOpen(false);
          setAddFilterOpen(false);
        }
      };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, []);

    // ── Filter helpers ───────────────────────────────────────
    const pickFilter = (filterId, value) => {
      const f = additionalFilters.find((x) => x.id === filterId);
      const selKey = f?.filterName || filterId;
      const isMulti = f?.multiSelect !== false; // default true

      if (isMulti) {
        // Toggle value in/out of the comma-joined string
        setActiveFilters((prev) => {
          const currentArr = prev[selKey] ? prev[selKey].split(",") : [];
          const already = currentArr.includes(value);
          const next = already
            ? currentArr.filter((v) => v !== value)
            : [...currentArr, value];
          if (next.length === 0) {
            const n = { ...prev };
            delete n[selKey];
            return n;
          }
          return { ...prev, [selKey]: next.join(",") };
        });
        // Keep dropdown open so user can pick more values
      } else {
        setActiveFilters((prev) => ({ ...prev, [selKey]: value }));
        setOpenDD(null);
      }
      setPageIndex?.(0);
    };

    const clearFilter = (filterId) => {
      const f = additionalFilters.find((x) => x.id === filterId);
      setActiveFilters((prev) => {
        const n = { ...prev };
        delete n[f?.filterName || filterId];
        return n;
      });
    };

    const clearAllFilters = () => {
      setActiveFilters({});
      setActiveFilterIds([]);
    };
    const shownFilters = additionalFilters.filter((f) =>
      activeFilterIds.includes(f.id),
    );

    // ── Render ──────────────────────────────────────────────
    return (
      <>
        {/* ── Toolbar ── */}
        <div ref={toolbarRef} className="table-toolbar">
          {/* ── LEFT: scrollable filter row ── */}
          <div
            className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto overflow-y-visible pb-0.5"
            style={{ scrollbarWidth: "none" }}
          >
            {/* Search bar */}
            {enableSearch && (
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-[5px] bg-white w-full sm:min-w-[220px] sm:w-auto max-w-full flex-shrink-0 focus-within:border-blue-600 transition-colors">
                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput?.(e.target.value);
                    setPageIndex?.(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setPageIndex?.(1);
                  }}
                  className="border-none outline-none text-[13px] text-gray-800 bg-transparent w-full placeholder-gray-300"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput?.("");
                      setPageIndex?.(1);
                    }}
                    className="border-none bg-transparent cursor-pointer p-0 flex text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Active filter pills */}
            {shownFilters.map((filter) => {
              const selKey = filter.filterName || filter.id;
              const selected = activeFilters[selKey];
              const ddOpen = openDD === filter.id;
              const q = ddSearch[filter.id] || "";
              const opts = filter.options.filter((o) =>
                o.label.toLowerCase().includes(q.toLowerCase()),
              );
              return (
                <FilterPill
                  key={filter.id}
                  filter={filter}
                  selected={selected}
                  ddOpen={ddOpen}
                  q={q}
                  opts={opts}
                  activeFilters={activeFilters}
                  selKey={selKey}
                  onOpen={() => setOpenDD(ddOpen ? null : filter.id)}
                  onClear={(e) => {
                    e.stopPropagation();
                    clearFilter(filter.id);
                  }}
                  onSearch={(val) =>
                    setDdSearch((p) => ({ ...p, [filter.id]: val }))
                  }
                  onPick={(val) => pickFilter(filter.id, val)}
                  onClose={() => setOpenDD(null)}
                />
              );
            })}

            {/* Add Filter button */}
            {additionalFilters.length > 0 && (
              <AddFilterButton
                additionalFilters={additionalFilters}
                activeFilterIds={activeFilterIds}
                addFilterOpen={addFilterOpen}
                activeFilters={activeFilters}
                onToggle={() => {
                  setAddFilterOpen((v) => !v);
                  setOpenDD(null);
                }}
                onClose={() => setAddFilterOpen(false)} // ← add
                onClearAllFilters={clearAllFilters}
                // onToggleFilter={(id) => {
                //   const isActive = activeFilterIds.includes(id);
                //   setActiveFilterIds((prev) =>
                //     isActive ? prev.filter((x) => x !== id) : [...prev, id],
                //   );
                //   if (!isActive) {
                //     setAddFilterOpen(false);
                //     setOpenDD(id);
                //   }
                // }}

                onToggleFilter={(id) => {
                  const isActive = activeFilterIds.includes(id);

                  if (isActive) {
                    // 🔥 REMOVE filter completely
                    const f = additionalFilters.find((x) => x.id === id);

                    setActiveFilters((prev) => {
                      const n = { ...prev };
                      delete n[f?.filterName || id];
                      return n;
                    });

                    setActiveFilterIds((prev) => prev.filter((x) => x !== id));
                  } else {
                    setActiveFilterIds((prev) => [...prev, id]);
                    setAddFilterOpen(false);
                    setOpenDD(id);
                  }
                }}
              />
            )}

            {/* Clear All — only when at least one filter has a selected value */}
            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={() => {
                  clearAllFilters();
                  setOpenDD(null);
                }}
                className="inline-flex items-center gap-1 px-3 py-[5px] h-[30px] rounded-full border border-red-200 text-[12px] text-red-500 bg-white cursor-pointer hover:bg-red-50 hover:border-red-400 transition-all whitespace-nowrap flex-shrink-0"
              >
                <X className="w-2.5 h-2.5" />
                Clear filters
              </button>
            )}

            {/* ✅ NEW: Extra buttons injected right after "Add Filter" */}
            {additionalFilterControls && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {additionalFilterControls}
              </div>
            )}
          </div>

          {/* ── RIGHT: additionalControls + Select Columns ── */}
          <div className="flex items-center gap-2 flex-shrink-0 relative flex-wrap justify-end w-full lg:w-auto">
            {/* Extra custom controls slot (right side) */}
            {additionalControls && (
              <div className="flex items-center gap-2">
                {additionalControls}
              </div>
            )}

            {/* Select Columns button + ColPanel (portal) */}
            {/* {showSelectColumn && ( */}
            {showSelectColumn &&
              columns.filter((c) => !c.pinnedRight).length > 10 && (
                <>
                  <button
                    ref={colBtnRef}
                    onClick={() => {
                      updateColPanelPos();
                      setColPanelOpen((v) => !v);
                      setOpenDD(null);
                      setAddFilterOpen(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-[5px] rounded-lg border text-[12px] cursor-pointer transition-all
              ${colPanelOpen ? "border-blue-600 text-blue-600 bg-blue-50" : "border-gray-200 bg-white text-gray-500 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"}`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    Select Columns
                  </button>
                  <PortalWrapper
                    isOpen={colPanelOpen}
                    onClose={() => setColPanelOpen(false)}
                    position={colPanelPos}
                    contentRef={colPanelRef}
                    referenceRef={colBtnRef}
                    style={{ zIndex: 99999 }}
                  >
                    <ColPanel
                      columns={columns.filter((c) => !c.pinnedRight)}
                      onToggleVisible={toggleColVisible}
                      onTogglePin={toggleColPin}
                      onReorder={reorderCol}
                      group={group}
                    />
                  </PortalWrapper>
                </>
              )}
          </div>
        </div>

        {/* ── Bulk Action Bar ── */}
        {selectable && selectedCount > 0 && (
          <BulkActionBar
            count={selectedCount}
            onClear={onClearSelection}
            actions={bulkActions}
          />
        )}
      </>
    );
  },
);

TableControl.displayName = "TableControl";

export default TableControl;
