/**
 * Drawer - A slide-in panel overlay component
 * 
 * @description A versatile drawer/modal panel that slides in from the right, left, or bottom.
 * Features include backdrop overlay, keyboard support (Escape to close), body scroll locking,
 * and customizable header/body/footer sections.
 * 
 * @example
 * // Basic right-side drawer
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Drawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="API Details"
 * >
 *   <p>Drawer content here</p>
 * </Drawer>
 * 
 * @example
 * // Bottom drawer for quick actions
 * <Drawer
 *   isOpen={showActions}
 *   onClose={() => setShowActions(false)}
 *   direction="bottom"
 *   size="sm"
 *   title="Quick Actions"
 *   footer={<Button onClick={confirm}>Confirm</Button>}
 * >
 *   <ActionList />
 * </Drawer>
 * 
 * @example
 * // Large left drawer for navigation menus
 * <Drawer
 *   isOpen={menuOpen}
 *   onClose={() => setMenuOpen(false)}
 *   direction="left"
 *   size="lg"
 *   title="Menu"
 * >
 *   <Navigation />
 * </Drawer>
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback when drawer should close
 * @param {string} props.title - Header title text
 * @param {React.ReactNode} [props.subtitle] - Optional subtitle below title
 * @param {React.ReactNode} props.children - Main content area
 * @param {React.ReactNode} [props.footer] - Fixed footer section
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Maximum width/height of drawer
 * @param {"right"|"left"|"bottom"} [props.direction="right"] - Slide-in direction
 */
import { X } from "lucide-react";
import { useEffect } from "react";

const SIZE_MAP = {
  sm: {
    right: "w-full max-w-full sm:max-w-[320px]",
    left: "w-full max-w-full sm:max-w-[320px]",
    bottom: "max-h-[70vh] sm:max-h-[40vh]",
  },
  md: {
    right: "w-full max-w-full sm:max-w-[420px]",
    left: "w-full max-w-full sm:max-w-[420px]",
    bottom: "max-h-[85vh] sm:max-h-[60vh]",
  },
  lg: {
    right: "w-full max-w-full sm:max-w-[620px]",
    left: "w-full max-w-full sm:max-w-[620px]",
    bottom: "max-h-[90vh] sm:max-h-[85vh]",
  },
};

const DIRECTION_STYLES = {
  right: {
    base: "fixed top-0 right-0 h-full w-full flex-col",
    open: "translate-x-0",
    closed: "translate-x-full",
  },
  left: {
    base: "fixed top-0 left-0 h-full w-full flex-col",
    open: "translate-x-0",
    closed: "-translate-x-full",
  },
  bottom: {
    base: "fixed bottom-0 left-0 w-full flex-col",
    open: "translate-y-0",
    closed: "translate-y-full",
  },
};

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md", // "sm" | "md" | "lg"
  direction = "right", // "right" | "left"
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const dir = DIRECTION_STYLES[direction] ?? DIRECTION_STYLES.right;
  const sizeClass = SIZE_MAP[size]?.[direction] ?? SIZE_MAP.md[direction];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[rgba(28,31,46,.3)] z-[9998] transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`${dir.base} ${sizeClass} bg-white shadow-2xl z-[9999] transition-transform duration-300 ease-out flex ${
          isOpen ? dir.open : dir.closed
        }`}
      >
        <div className="drawer-hd">
          <div>
            <div className="drawer-title">{title}</div>
            {subtitle && (
              <div className="flex items-center gap-2 mt-1">{subtitle}</div>
            )}
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="drawer-body flex-1 overflow-y-auto">{children}</div>

        {footer && <div className="drawer-ft">{footer}</div>}
      </div>
    </>
  );
}

/**
 * DrawerSection - A labeled section within a Drawer
 * 
 * @description Groups related content within a drawer with a styled section label.
 * 
 * @example
 * <Drawer isOpen={open} onClose={close} title="Details">
 *   <DrawerSection label="Basic Information">
 *     <DrawerRow label="Name" value="API Name" />
 *     <DrawerRow label="Version" value="2.0" />
 *   </DrawerSection>
 * </Drawer>
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Section header text
 * @param {React.ReactNode} props.children - Section content
 */
export function DrawerSection({ label, children }) {
  return (
    <div className="drawer-sec">
      <div className="drawer-sec-title">{label}</div>
      {children}
    </div>
  );
}

/**
 * DrawerRow - A key-value row display for Drawer content
 * 
 * @description Displays a label-value pair in a horizontal row layout.
 * Commonly used for showing metadata, properties, or configuration details.
 * 
 * @example
 * // Basic key-value pair
 * <DrawerRow label="Status" value="Active" />
 * 
 * @example
 * // Monospace value (for IDs, codes, etc.)
 * <DrawerRow label="API Key" value="sk-1234567890" mono />
 * 
 * @example
 * // With no border (last item in section)
 * <DrawerRow label="Created" value="2024-01-15" noBorder />
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Row label (left-aligned)
 * @param {React.ReactNode} props.value - Row value (right-aligned)
 * @param {boolean} [props.mono=false] - Use monospace font for value
 * @param {boolean} [props.noBorder=false] - Hide bottom border
 */
export function DrawerRow({ label, value, mono = false, noBorder = false }) {
  return (
    <div className={`drow ${noBorder ? "border-0" : ""}`}>
      <span className="dkey">{label}</span>
      <span
        className={`dval ${mono ? "font-mono text-[11px] text-[#6b7280] break-all text-right" : ""}`}
        style={!mono ? { textAlign: "right" } : undefined}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

/**
 * DrawerTags - Displays a list of tags within a Drawer
 * 
 * @description Renders an array of tags as small badges, wrapped and right-aligned.
 * Useful for displaying multiple labels, categories, or keywords.
 * 
 * @example
 * // Basic usage
 * <DrawerTags tags={["REST", "Authenticated", "Rate Limited"]} />
 * 
 * @example
 * // Empty state handled automatically
 * <DrawerTags tags={[]} />  // Shows "—" placeholder
 * 
 * @param {Object} props - Component props
 * @param {string[]} [props.tags] - Array of tag strings to display
 */
export function DrawerTags({ tags }) {
  if (!tags?.length) return <span className="dval">—</span>;
  return (
    <div className="flex gap-1 flex-wrap justify-end">
      {tags.map((t) => (
        <span
          key={t}
          className="badge b-gray"
          style={{ fontSize: "10.5px", padding: "1px 6px" }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/**
 * DrawerUptimeStrip - Visual 30-day uptime history chart
 * 
 * @description Displays a strip of colored blocks representing uptime percentage
 * over the last 30 days. Green indicates good uptime, amber for warnings, red for downtime.
 * 
 * @example
 * <DrawerUptimeStrip uptime={99.9} status="active" />
 * 
 * @example
 * // With warning status
 * <DrawerUptimeStrip uptime={97.5} status="warning" />
 * 
 * @param {Object} props - Component props
 * @param {number} props.uptime - Uptime percentage (0-100)
 * @param {"active"|"down"|"warning"} [props.status] - Current status affecting display
 */
export function DrawerUptimeStrip({ uptime, status }) {
  const color =
    uptime >= 99
      ? "var(--green)"
      : uptime >= 97
        ? "var(--amber)"
        : "var(--red)";

  const blocks = Array.from({ length: 30 }, (_, i) => {
    if (status === "down" && i >= 28) return "var(--red)";
    if (status === "warning" && (i === 25 || i === 28)) return "var(--amber)";
    if (Math.random() < 0.02 && uptime < 99) return "var(--amber)";
    if (Math.random() < 0.005 && uptime < 95) return "var(--red)";
    return "var(--green)";
  });

  return (
    <div className="mb-4" style={{ paddingBottom: 12 }}>
      <div className="drawer-sec-title">30-Day Uptime</div>
      <div className="flex gap-[1.5px] h-3 items-stretch">
        {blocks.map((c, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 1.5, background: c }} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="txt-xs">30d ago</span>
        <span className="txt-xs font-mono" style={{ color }}>
          {uptime}%
        </span>
        <span className="txt-xs">Today</span>
      </div>
    </div>
  );
}
