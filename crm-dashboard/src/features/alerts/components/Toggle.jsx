export const Toggle = ({ checked, onChange, disabled }) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onChange(!checked);
    }}
    className={`relative w-9 h-5 flex-shrink-0 ${disabled ? "opacity-50" : "cursor-pointer"}`}
  >
    <div
      className={`absolute inset-0 rounded-full transition-colors duration-200 ${checked ? "bg-green-500" : "bg-gray-200"}`}
    />
    <div
      className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : ""}`}
    />
  </div>
);
