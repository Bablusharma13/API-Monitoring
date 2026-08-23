import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";


function ActionsCell({ row, actions = [] }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = (e) => {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX,
    });
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const normalActions = actions.filter((a) => !a.danger);
  const dangerActions = actions.filter((a) => a.danger);

  return (
    <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={openMenu}
        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "absolute",
            top: menuPos.top,
            left: menuPos.left,
            transform: "translateX(-100%)",
            zIndex: 99999,
          }}
          className="min-w-[150px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
        >
          {normalActions.map((action) => (
            <button
              key={action.name}
              onClick={() => { setOpen(false); action.onClick(row); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {action.icon}
              {action.name}
            </button>
          ))}
          {dangerActions.length > 0 && normalActions.length > 0 && (
            <div className="border-t border-gray-100 mx-2" />
          )}
          {dangerActions.map((action) => (
            <button
              key={action.name}
              onClick={() => { setOpen(false); action.onClick(row); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
            >
              {action.icon}
              {action.name}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
export default ActionsCell;

