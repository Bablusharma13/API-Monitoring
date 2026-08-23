export const THEME_STORAGE_KEY = "crm-dashboard-theme";

/** @typedef {"light" | "dark"} Theme */

/** @returns {Theme} */
export function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

/** @param {Theme} theme */
export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

/** Run before React paint (also in index.html) */
export function initTheme() {
  applyTheme(getStoredTheme());
}
