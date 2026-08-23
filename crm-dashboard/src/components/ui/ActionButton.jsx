/**
 * ActionButton - A pre-configured bulk action button component
 * 
 * @description Renders action buttons commonly used in bulk action bars (e.g., for
 * table row selections). Each action has a predefined icon, label, and styling variant.
 * 
 * Available actions:
 * - "export" - Download icon, exports selected items
 * - "assign" - UserPlus icon, assigns owner to selected items
 * - "enable" - Power icon, enables selected items
 * - "disable" - PowerOff icon, disables selected items
 * - "delete" - Trash2 icon, deletes selected items (danger variant)
 * - "clear" - X icon, clears current selection
 * 
 * @example
 * // Single button usage
 * <ActionButton action="export" onClick={(action) => handleExport()} />
 * 
 * @example
 * // Multiple buttons in a bulk action bar
 * const bulkActions = [
 *   { action: "export", onClick: handleExport },
 *   { action: "assign", onClick: handleAssign },
 *   { action: "delete", onClick: handleDelete },
 * ];
 * 
 * {bulkActions.map((btn) => (
 *   <ActionButton key={btn.action} action={btn.action} onClick={btn.onClick} />
 * ))}
 * 
 * @param {Object} props - Component props
 * @param {keyof typeof BUTTON_CONFIG} props.action - Predefined action type
 * @param {Function} [props.onClick] - Callback function when button is clicked, receives action string as argument
 */
import { Download, UserPlus, Power, PowerOff, Trash2, X, Save, Search, Pen } from "lucide-react";

const BUTTON_CONFIG = {
  export: {
    icon: Download,
    label: "Export",
    variant: "default",
  },
  assign: {
    icon: UserPlus,
    label: "Assign Owner",
    variant: "default",
  },
  enable: {
    icon: Power,
    label: "Enable",
    variant: "default",
  },
  disable: {
    icon: PowerOff,
    label: "Disable",
    variant: "danger",
  },
  delete: {
    icon: Trash2,
    label: "Delete",
    variant: "danger",
  },
  clear: {
    icon: X,
    label: "Clear",
    variant: "default",
  },
  save: {
    icon: Save,
    label: "Save",
    variant: "default",
  },
  search: {
    icon: Search,
    label: "Search",
    variant: "primary",
  },
  refresh: {
    icon: Search,
    label: "Search",
    variant: "warn",
  },
  edit: {
    icon: Pen,
    label: "Edit",
    variant: "default",
  },
};

export function ActionButton({ action, onClick, label, icon: IconOverride, className }) {
  const config = BUTTON_CONFIG[action];
  if (!config) return null;

  const Icon = IconOverride !== undefined ? IconOverride : config.icon;

  return (
    <button
      onClick={() => onClick?.(action)}
      className={`bulk-btn bulk-btn-${config.variant} ${className}`}
    >
      {Icon ? <Icon className="w-3 h-3" /> : null}
      {label ?? config.label}
    </button>
  );
}
