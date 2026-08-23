import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowUp, ArrowDown } from "lucide-react";

/**
 * HeaderDropdownMenu
 * Portal-based column header dropdown for TableComponents/Table.jsx.
 * Mirrors the structure of FriendTableComponets/HeaderDropdownMenu.jsx.
 *
 * Props:
 *  col         – column definition object { id, name, pinned, disableSortBy }
 *  isOpen      – boolean
 *  triggerRef  – ref attached to the <th> element (menu anchors to its left edge)
 *  onClose     – () => void
 *  onSortAsc   – () => void
 *  onSortDesc  – () => void
 *  onPin       – () => void
 *  onHide      – () => void
 */
const HeaderDropdownMenu = ({
  col,
  isOpen,
  triggerRef,
  onClose,
  onSortAsc,
  onSortDesc,
  onPin,
  onHide,
  totalColumns,
}) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const rafRef = useRef(null);

  // Position the menu below the left edge of the <th> anchor
  const calcPos = useCallback(() => {
    if (!triggerRef?.current) return null;
    const r = triggerRef.current.getBoundingClientRect();
    let left = r.left; // start at the left edge of the header cell
    let top = r.bottom + 4;
    const menuW = 160;
    const menuH = 160;
    // Flip right if it would overflow the viewport right edge
    if (left + menuW > window.innerWidth - 8) left = r.right - menuW;
    if (left < 8) left = 8;
    // Flip above if it would overflow below
    if (top + menuH > window.innerHeight - 8) top = r.top - menuH - 4;
    if (top < 8) top = 8;
    return { top, left };
  }, [triggerRef]);

  // Set position synchronously before first paint
  useLayoutEffect(() => {
    if (!isOpen) return;
    const p = calcPos();
    if (p) setPos(p);
  }, [isOpen, calcPos]);

  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const p = calcPos();
        if (p) setPos(p);
        else onClose();
      });
    };

    const handleOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("scroll", update, { capture: true, passive: true });
    window.addEventListener("resize", update, { passive: true });
    // Small delay before attaching outside-click so the opening click doesn't
    // immediately close the menu (same pattern as FriendTable's HeaderDropdownMenu)
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleKey);
    }, 80);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", update, { capture: true });
      window.removeEventListener("resize", update);
      clearTimeout(t);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, calcPos, onClose, triggerRef]);

  if (!isOpen) return null;

  // ── Exact same markup + CSS as the original inline menu in Table.jsx ──
  return createPortal(
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 700 }}
      className="min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
    >
      {!col.disableSortBy && (
        <>
          <div
            onClick={() => {
              onSortAsc();
              onClose();
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5 text-indigo-500" /> Ascending
          </div>
          <div
            onClick={() => {
              onSortDesc();
              onClose();
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5 text-indigo-500" /> Descending
          </div>
          <div className="h-px bg-gray-100 my-[3px]" />
        </>
      )}
      <div
        onClick={() => {
          onPin();
          onClose();
        }}
        className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-gray-800 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={col.pinned ? "#f59e0b" : "#10b981"}
          strokeWidth="2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {col.pinned ? "Unpin" : "Pin / Sticky"}
      </div>
      <div className="h-px bg-gray-100 my-[3px]" />

      {totalColumns > 10 && !col.default && (
        <>
          <div className="h-px bg-gray-100 my-[3px]" />
          <div
            onClick={() => {
              onHide();
              onClose();
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-red-600 cursor-pointer hover:bg-red-50 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            Hide Column
          </div>
        </>
      )}
    </div>,
    document.body,
  );
};

export default HeaderDropdownMenu;
