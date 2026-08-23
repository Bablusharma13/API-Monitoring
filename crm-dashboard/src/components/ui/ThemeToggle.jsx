import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme/ThemeContext.jsx";

/**
 * Pill sun/moon toggle (similar to chaicode.com / modern dev sites).
 */
export default function ThemeToggle({ className = "", size = "md" }) {
  const { theme, setTheme, isDark } = useTheme();

  const h = size === "sm" ? "h-8" : "h-9";
  const w = size === "sm" ? "w-[4.25rem]" : "w-[4.75rem]";
  const icon = size === "sm" ? 14 : 15;

  return (
    <div
      className={`theme-toggle ${w} ${h} rounded-full p-0.5 flex items-center relative border transition-colors ${className}`}
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`relative z-10 flex-1 flex items-center justify-center ${h} rounded-full transition-colors ${
          !isDark ? "text-amber-600" : "text-stone-500 hover:text-stone-300"
        }`}
        aria-pressed={!isDark}
        aria-label="Light mode"
      >
        <Sun size={icon} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`relative z-10 flex-1 flex items-center justify-center ${h} rounded-full transition-colors ${
          isDark ? "text-amber-300" : "text-stone-400 hover:text-stone-600"
        }`}
        aria-pressed={isDark}
        aria-label="Dark mode"
      >
        <Moon size={icon} strokeWidth={2} />
      </button>
      <span
        className="absolute top-0.5 bottom-0.5 w-[calc(50%-4px)] rounded-full transition-[left] duration-300 ease-out theme-toggle-thumb"
        style={{ left: isDark ? "calc(50% + 1px)" : "2px" }}
        aria-hidden
      />
    </div>
  );
}
