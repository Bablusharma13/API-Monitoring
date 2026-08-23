/**
 * Sidebar - A collapsible navigation sidebar component
 * 
 * @description A feature-rich sidebar for application navigation with support for:
 * - Collapsible/expandable modes
 * - Multi-level nested menu items (L1, L2, L3)
 * - Category grouping with custom colors
 * - Icon support (URL images or SVG fallback)
 * - Mobile-responsive with close button
 * - Tooltips when collapsed
 * - Loading skeleton states
 * - Icon mapping from API slug/title to icon type
 * 
 * Menu items are transformed from API format:
 * Expected API structure:
 * {
 *   _id: string,
 *   title: string,
 *   slug: string,
 *   category: string,
 *   href: string,
 *   Icon?: string (URL to image),
 *   children?: [{ title, href, children? }]
 * }
 * 
 * @example
 * // Basic usage
 * const [collapsed, setCollapsed] = useState(false);
 * 
 * <Sidebar
 *   collapsed={collapsed}
 *   setCollapsed={setCollapsed}
 *   menuItems={menuData}
 *   loading={false}
 * />
 * 
 * @example
 * // Mobile usage
 * const [mobileOpen, setMobileOpen] = useState(false);
 * 
 * <Sidebar
 *   isMobile={isMobile}
 *   onClose={() => setMobileOpen(false)}
 *   menuItems={menuData}
 * />
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.collapsed=false] - Sidebar collapsed state
 * @param {Function} props.setCollapsed - Toggle collapsed state
 * @param {Array} props.menuItems - Navigation items from API
 * @param {boolean} [props.loading=false] - Show loading skeletons
 * @param {boolean} [props.isMobile=false] - Mobile mode (shows close button)
 * @param {Function} [props.onClose] - Callback for mobile close button
 */
import { useState, useRef, useEffect } from "react";
import { isValidUrl } from "../../utils/helpers";
import { Link } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";
import { useTheme } from "../../theme/ThemeContext.jsx";

// ─── Icon primitives ────────────────────────────────────────────────
const Ico = ({ d, stroke, size = 17 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

const ICONS = {
  eta: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      }
    />
  ),
  docs: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </>
      }
    />
  ),
  monitor: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </>
      }
    />
  ),
  globe: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </>
      }
    />
  ),
  chat: (c) => (
    <Ico
      stroke={c}
      d={
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      }
    />
  ),
  heart: (c) => (
    <Ico
      stroke={c}
      d={
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      }
    />
  ),
  users: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      }
    />
  ),
  send: (c) => <Ico stroke={c} d={<path d="M3 11l19-9-9 19-2-8-8-2z" />} />,
  briefcase: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </>
      }
    />
  ),
  calendar: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      }
    />
  ),
  dollar: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      }
    />
  ),
  card: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <rect x="1" y="4" width="22" height="16" rx="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </>
      }
    />
  ),
  chart: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </>
      }
    />
  ),
  forum: (c) => (
    <Ico
      stroke={c}
      d={
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      }
    />
  ),
  layers: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </>
      }
    />
  ),
  code: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="10 13 8 15 10 17" />
          <polyline points="14 13 16 15 14 17" />
        </>
      }
    />
  ),
  mail: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </>
      }
    />
  ),
  sliders: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </>
      }
    />
  ),
  user: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </>
      }
    />
  ),
  logout: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </>
      }
    />
  ),
  drive: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <path d="M22 17H2a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h20a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3z" />
          <path d="M3 17l3-6h12l3 6" />
        </>
      }
    />
  ),
  default: (c) => (
    <Ico
      stroke={c}
      d={
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </>
      }
    />
  ),
  chevron: () => (
    <Ico stroke="#9ca3af" size={11} d={<polyline points="9 18 15 12 9 6" />} />
  ),
};

// ─── Map API slug/title to icon key ─────────────────────────────────
const SLUG_TO_ICON = {
  eta: "eta",
  docs: "docs",
  "docs-module": "docs",
  "api-monitor": "layers",
  billing: "card",
  calendar: "calendar",
  career: "briefcase",
  clients: "users",
  drive: "drive",
  "email-service": "mail",
  forum: "forum",
  inex: "dollar",
  "live-chat": "chat",
  logs: "code",
  marketing: "send",
  marketxy: "monitor",
  poll: "chart",
  settings: "sliders",
  support: "heart",
  team: "users",
  teams: "users",
  "whois-data-center": "globe",

  dashboard: "monitor",
  apis: "layers",
  incidents: "chart",
  categories: "sliders",
  checks: "eta",
  leaderboard: "chart",
  "cron-monitor": "eta",
  "cron-inventory": "layers",
  "job-history": "docs",
  tenants: "users",
  "endpoint-explorer": "globe",
  "request-log": "code",
  latency: "chart",
  "archive-browser": "drive",
  "buffer-dashboard": "layers",
  "pipeline-monitor": "monitor",
  "retention-rules": "docs",
  "storage-tiers": "drive",
  alerts: "chat",
  "quota-limits": "sliders",
  analytics: "chart",
};

// ─── Map category to section label ──────────────────────────────────
const CATEGORY_LABELS = {
  workspace: "Workspace",
  product: "Product",
  "sales & marketing": "Sales & Marketing",
  manpower: "Manpower",
  operations: "Operations",
  finance: "Finance",
  community: "Community",
  analytics: "Analytics & Traffic",
  system: "System",

  "api-monitoring": "API Monitoring",
  "cron-jobs": "Cron Jobs",
  "tenant-monitoring": "Tenant Monitoring",
  logs: "Logs & Data",
  alerts: "Alerts & Notifications",
};

// Section ordering
const SECTION_ORDER = [
  "api-monitoring",
  "cron-jobs",
  "tenant-monitoring",
  "logs",
  "alerts",
  "analytics",
  "workspace",
  "product",
  "sales & marketing",
  "manpower",
  "operations",
  "finance",
  "community",
  "system",
];

// Color palette assigned per top-level item
const COLOR_PALETTE = [
  "#0891b2",
  "#9333ea",
  "#2563eb",
  "#06b6d4",
  "#ca8a04",
  "#dc2626",
  "#3b6ef7",
  "#c026d3",
  "#7c3aed",
  "#b45309",
  "#0d9488",
  "#ea6c00",
  "#16a34a",
  "#ea580c",
  "#059669",
  "#475569",
  "#4f46e5",
  "#0284c7",
  "#64748b",
  "#0891b2",
];

let colorIndex = 0;
const assignedColors = {};

function getColor(id) {
  if (!assignedColors[id]) {
    assignedColors[id] = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
    colorIndex++;
  }
  return assignedColors[id];
}

// ─── Transform API data → NAV format ────────────────────────────────
function transformMenuItems(menuItems, currentPath) {
  if (!menuItems || !menuItems.length) return [];

  // Group items by category
  const grouped = {};
  for (const item of menuItems) {
    const cat = (item.category || "workspace").toLowerCase();
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  // Build sections in defined order, then any extras
  const allCats = [
    ...SECTION_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !SECTION_ORDER.includes(c)),
  ];

  return allCats.map((cat) => ({
    section: CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
    items: grouped[cat]
      .sort((a, b) => a.order - b.order)
      .map((item) => transformItem(item, currentPath)),
  }));
}

function transformItem(item, currentPath) {
  const color = getColor(item._id);
  const iconKey =
    SLUG_TO_ICON[item.slug] ||
    SLUG_TO_ICON[item.title?.toLowerCase().replace(/\s+/g, "-")] ||
    "default";

  return {
    id: item._id,
    label: item.title,
    icon: item.Icon,
    fallbackIcon: iconKey,
    color,
    href: item.href,
    active: item.href === currentPath,
    defaultOpen: true,
    children: (item.children || []).map((child) =>
      transformChild(child, color, currentPath),
    ),
  };
}

function transformChild(child, color, currentPath) {
  const hasChildren = child.children && child.children.length > 0;
  return {
    label: child.title,
    href: child.href,
    color,
    active: child.href === currentPath,
    defaultOpen: child.defaultOpen || false,
    ...(hasChildren
      ? {
          children: child.children.map((grandchild) =>
            transformGrandchild(grandchild, color, currentPath),
          ),
        }
      : {}),
  };
}

function transformGrandchild(item, color, currentPath) {
  return {
    label: item.title,
    href: item.href,
    color,
    active: item.href === currentPath,
  };
}

// ─── Animated height collapse ────────────────────────────────────────
function Collapse({ open, children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(open ? "auto" : "0px");
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!ref.current) return;
    if (open) {
      const h = ref.current.scrollHeight;
      setHeight(`${h}px`);
      const t = setTimeout(() => setHeight("auto"), 260);
      return () => clearTimeout(t);
    } else {
      setHeight(`${ref.current.scrollHeight}px`);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setHeight("0px")),
      );
    }
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ height, overflow: "hidden", transition: "height 0.24s ease" }}
    >
      {children}
    </div>
  );
}

// ─── L2 leaf (deepest level) ─────────────────────────────────────────
function L2Item({ label, href, active: initActive, color }) {
  const [active, setActive] = useState(initActive || false);
  useEffect(() => setActive(initActive || false), [initActive]);
  return (
    <Link
      to={href || "#"}
      onClick={(e) => {
        if (!href || href === "#") e.preventDefault();
        setActive(true);
      }}
        className={`flex items-center gap-1.5 py-[4px] px-2 rounded-md text-[13px] mr-1.5 transition-all duration-150
        ${
          active
            ? "text-amber-300 font-medium bg-amber-400/10 border-r-[2px] border-amber-400"
            : "text-stone-400 hover:text-amber-200 hover:bg-white/5"
        }`}
    >
      <span
        className="w-[5px] h-[5px] rounded-full flex-shrink-0 opacity-40"
        style={{ background: color }}
      />
      {label}
    </Link>
  );
}

// ─── L1 item (can have L2 children) ─────────────────────────────────
function L1Item({
  label,
  href,
  active: initActive,
  color,
  children,
  defaultOpen,
}) {
  const hasChildren = children && children.length > 0;
  const [open, setOpen] = useState(
    defaultOpen || (hasChildren && children.some((c) => c.active)),
  );
  const [active, setActive] = useState(initActive || false);
  useEffect(() => setActive(initActive || false), [initActive]);

  return (
    <div>
      <Link
        to={hasChildren ? "#" : href || "#"}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setOpen((o) => !o);
          } else {
            if (!href || href === "#") e.preventDefault();
            setActive(true);
          }
        }}
        className={`flex items-center gap-2 py-[5px] px-2 rounded-md text-[13.5px] mr-1.5 transition-all duration-150
          ${
            active && !hasChildren
              ? "text-amber-300 font-medium bg-amber-400/10 border-r-[2px] border-amber-400"
              : "text-stone-300 hover:text-amber-200 hover:bg-white/5"
          }`}
      >
        <span
          className="w-[5px] h-[5px] rounded-full flex-shrink-0 opacity-40"
          style={{ background: color }}
        />
        <span className="flex-1 leading-tight">{label}</span>
        {hasChildren && (
          <span
            className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          >
            {ICONS.chevron()}
          </span>
        )}
      </Link>

      {hasChildren && (
        <Collapse open={open}>
          <div
            className="pl-4 ml-[7px]"
            style={{ borderLeft: `1px solid ${color}28` }}
          >
            {children.map((c, i) => (
              <L2Item key={i} {...c} color={color} />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
}

// ─── Top-level nav item ──────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  const hasChildren = item.children && item.children.length > 0;
  const [open, setOpen] = useState(
    item.defaultOpen ||
      (hasChildren &&
        item.children.some(
          (c) => c.active || c.children?.some((x) => x.active),
        )),
  );

  // Resolve icon: use SVG URL or mapped key
  const renderIcon = () => {
    if (item.icon && isValidUrl(item.icon)) {
      return (
        <img
          src={item.icon}
          alt={item.label}
          width={17}
          height={17}
          style={{ flexShrink: 0 }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      );
    }
    const iconFn = ICONS[item.fallbackIcon] || ICONS.default;
    return iconFn(item.color);
  };

  const isActive = Boolean(item.active) && !hasChildren;

  return (
    <div>
      <div className="relative group/navtip">
        <Link
          to={hasChildren ? "#" : item.href || "#"}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault();
              if (!collapsed) setOpen((o) => !o);
            } else if (!item.href || item.href === "#") {
              e.preventDefault();
            }
          }}
          className={`flex items-center gap-2 px-[10px] py-[4px] cursor-pointer select-none
            transition-colors duration-150 hover:bg-white/5 border-r-[3px]
            ${isActive ? "bg-amber-400/10 border-amber-400" : "border-transparent"}`}
        >
          <span className="w-7 h-7 flex items-center justify-center flex-shrink-0">
            {renderIcon()}
          </span>
          <span
            className={`sidebar-item-label ${
              collapsed
                ? "sidebar-item-label-collapsed"
                : "sidebar-item-label-expanded"
            } ${isActive ? "text-amber-300 font-semibold" : "text-stone-200"}`}
          >
            {item.label}
          </span>
          {!collapsed && hasChildren && (
            <span
              className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            >
              {ICONS.chevron()}
            </span>
          )}
        </Link>

        {/* Collapsed tooltip */}
        {collapsed && (
          <div
            className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2
            bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-[200]
            opacity-0 group-hover/navtip:opacity-100 pointer-events-none transition-opacity duration-150"
          >
            {item.label}
          </div>
        )}
      </div>

      {!collapsed && hasChildren && (
        <Collapse open={open}>
          <div
            className="relative ml-[22px] pl-3.5"
            style={{ borderLeft: `1px solid ${item.color}33` }}
          >
            {item.children.map((c, i) => (
              <L1Item key={i} {...c} color={item.color} />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  );
}

// ─── Skeleton item ────────────────────────────────────────────────────
function SkeletonItem({ collapsed }) {
  if (collapsed) {
    return (
      <div className="px-[10px] py-[4px]">
        <div className="w-5 h-5 rounded-md bg-gray-200 animate-pulse" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-[10px] py-[4px]">
      <div className="w-5 h-5 rounded-md bg-gray-200 animate-pulse" />
      <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

// ─── Skeleton section ─────────────────────────────────────────────────
function SkeletonSection({ collapsed }) {
  if (collapsed) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonItem key={i} collapsed />
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-1 mt-5">
      <div className="h-2 w-16 mx-[10px] mb-2 rounded bg-gray-200 animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonItem key={i} collapsed={false} />
      ))}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────
export default function Sidebar({
  collapsed,
  setCollapsed,
  menuItems,
  loading,
  isMobile,
  onClose,
  currentPath,
}) {
  const { isDark } = useTheme();
  // Transform API menuItems into NAV format, memoized by reference
  const nav = transformMenuItems(menuItems, currentPath);

  return (
    <aside
      className={`relative flex flex-col h-screen 
        transition-all duration-200 ${collapsed && "w-[52px]"}`}
    >
      {/* Desktop Toggle */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-[13px] top-4 w-[26px] h-[26px] rounded-full fa-surface
            border border-stone-700 flex items-center justify-center z-50
            shadow-sm hover:border-stone-500 transition-shadow duration-150"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2.5"
            className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Mobile Close Button */}
      {isMobile && (
        <button
          onClick={onClose}
          className="absolute -right-3 top-4 w-8 h-8 rounded-full bg-white
            border border-gray-200 flex items-center justify-center z-50 shadow-md"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Logo */}
      <div className={`h-[52px] px-[13px] flex items-center gap-2.5 border-b flex-shrink-0 overflow-hidden ${isDark ? "border-stone-800/80" : "border-gray-200"}`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 40 40"
          fill="none"
          className="flex-shrink-0"
        >
          <rect x="2" y="2" width="36" height="36" rx="10" fill="#ffffff" opacity="0.08" />
          <path
            d="M11 25 L17 13 L29 13"
            stroke="#fafafa"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="29" cy="13" r="2.4" fill="#fbbf24" />
        </svg>
        <span
          className={`text-[11px] font-semibold tracking-tight text-stone-50 whitespace-nowrap
          transition-opacity duration-200 ${collapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          CRM<span className="text-amber-300">.</span>
          <span className="text-stone-500 font-normal">dashboard</span>
        </span>
      </div>

      {/* Scrollable nav */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden
        [&::-webkit-scrollbar]:w-[3px]
        [&::-webkit-scrollbar-thumb]:bg-gray-200
        [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        <div className="py-1">
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  {i > 0 && (
                    <div className="mx-3 my-1 border-t border-gray-100" />
                  )}
                  <SkeletonSection collapsed={collapsed} />
                </div>
              ))}
            </>
          ) : (
            <>
              {nav.map((group, gi) => (
                <div key={gi}>
                  {gi > 0 && (
                    <div className="mx-3 my-1 border-t border-gray-100" />
                  )}
                  <div
                    className={`sidebar-section-label ${
                      collapsed
                        ? "sidebar-section-label-collapsed"
                        : "sidebar-section-label-expanded"
                    }`}
                  >
                    {group.section}
                  </div>

                  {group.items.map((item, ii) => (
                    <NavItem key={ii} item={item} collapsed={collapsed} />
                  ))}
                </div>
              ))}

              {/* Empty state */}
              {nav.length === 0 && !collapsed && (
                <div className="text-center text-gray-400 text-[12px] py-8 px-4">
                  No menu items found
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={`flex-shrink-0 border-t py-2 ${isDark ? "border-stone-800/80" : "border-gray-200"}`}>
        {!collapsed && (
          <div className="px-[13px] pb-2 flex items-center justify-between gap-2">
            <span className={`text-[10px] font-mono ${isDark ? "text-stone-500" : "text-gray-400"}`}>
              Theme
            </span>
            <ThemeToggle size="sm" />
          </div>
        )}
        <div
          className={`text-[10px] px-[13px] py-1 font-mono whitespace-nowrap
          transition-opacity duration-200 ${collapsed ? "opacity-0 h-0 py-0 overflow-hidden" : "opacity-100"} ${isDark ? "text-stone-500" : "text-gray-400"}`}
        >
          Version 1.3.0
        </div>
        {[
          {
            label: "Login",
            icon: "user",
            color: "#0284c7",
            link: "/login",
          },
          {
            label: "Logout",
            icon: "logout",
            color: "#ef4444",
            link: "/logout",
          },
        ].map(({ label, icon, color, link }) => (
          <div key={label} className="relative group/ftip">
            <Link
              to={link || "#"}
              onClick={(e) => {
                if (!link || link === "#") e.preventDefault();
              }}
              className={`flex items-center gap-2 px-[10px] py-[5px] transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}
            >
              <span className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                {ICONS[icon]?.(color)}
              </span>
              <span
                className={`text-[13.5px] font-medium whitespace-nowrap
                transition-opacity duration-200 ${collapsed ? "opacity-0 w-0 overflow-hidden pointer-events-none" : "opacity-100"} ${isDark ? "text-stone-300" : "text-gray-700"}`}
              >
                {label}
              </span>
            </Link>
            {collapsed && (
              <div
                className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2
                bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-[200]
                opacity-0 group-hover/ftip:opacity-100 pointer-events-none transition-opacity duration-150"
              >
                {label}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
