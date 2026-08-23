import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import { sidebarMenuItems } from "./sidebarMenuItems";
import ThemeToggle from "../ui/ThemeToggle";
import { useTheme } from "../../theme/ThemeContext.jsx";

const BrandMark = ({ dark = true }) => (
  <svg width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden>
    <rect
      x="2"
      y="2"
      width="36"
      height="36"
      rx="10"
      fill={dark ? "#ffffff" : "#0c0a09"}
      opacity={dark ? 0.08 : 0.06}
    />
    <path
      d="M11 25 L17 13 L29 13"
      stroke={dark ? "#fafafa" : "#1c1917"}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="29" cy="13" r="2.6" fill="#fbbf24" />
    {dark && <circle cx="11" cy="25" r="2.2" fill="#ffffff" />}
  </svg>
);

export const ApplicationLayout = () => {
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div
      className={`relative min-h-screen app-shell ${isDark ? "app-shell-dark text-stone-50" : "app-shell-light text-gray-900"}`}
    >
      {isDark && (
        <>
          <div className="fa-aurora pointer-events-none fixed inset-x-0 top-0 z-0" />
          <div className="fa-grid-bg fa-fade-radial pointer-events-none fixed inset-0 z-0 opacity-60" />
        </>
      )}

      <header className="fixed top-0 left-0 right-0 z-30 px-4 pt-3 md:hidden">
        <div
          className={`rounded-2xl flex items-center gap-2 px-3 py-2.5 ${isDark ? "fa-surface" : "bg-white border border-gray-200 shadow-sm"}`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0 ${
              isDark ? "hover:bg-white/5 text-stone-300" : "hover:bg-gray-100 text-gray-600"
            }`}
            aria-label="Open menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <BrandMark dark={isDark} />
          <span
            className={`text-[14px] tracking-tight font-semibold truncate flex-1 min-w-0 ${isDark ? "text-stone-50" : "text-gray-900"}`}
          >
            CRM<span className="text-amber-500">.</span>
            <span className={isDark ? "text-stone-500 font-normal" : "text-gray-500 font-normal"}>
              dashboard
            </span>
          </span>
          <ThemeToggle size="sm" />
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[min(85vw,20rem)] border-r transition-transform duration-300 ease-out ${
            isDark ? "fa-surface border-stone-800" : "bg-white border-gray-200 shadow-xl"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar
            menuItems={sidebarMenuItems}
            collapsed={false}
            setCollapsed={() => {}}
            currentPath={location.pathname}
            loading={false}
            isMobile
            onClose={() => setMobileOpen(false)}
          />
        </div>
      </div>

      <div
        className={`wrapper-sidebar hidden md:flex border-r ${
          isDark ? "fa-surface border-stone-800/80" : "bg-white border-gray-200"
        } ${collapsed ? "w-[52px] !max-w-[52px]" : ""}`}
      >
        <Sidebar
          menuItems={sidebarMenuItems}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          currentPath={location.pathname}
          loading={false}
        />
      </div>

      <main
        className={`main-content relative z-10 transition-all duration-300 ease-in-out pt-[4.25rem] md:pt-3 md:pr-3 ${
          collapsed ? "wrapper-collapsed" : "wrapper-expanded"
        }`}
      >
        <div className="hidden md:flex justify-end mb-3 max-w-full">
          <ThemeToggle />
        </div>
        <div className="wrapper-main">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ApplicationLayout;
