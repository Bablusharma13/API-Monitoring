"use client";

// ─── Avatar Component ───────────────────────────────────────────────
const sizeMap = {
  xsm: {
    container: "w-6 h-6",
    text: "text-[6px]",
    border_color: "border-blue-500",
    text_bg: "bg-blue-50",
    text_color: "text-blue-500",
  },
  sm: {
    container: "w-10 h-10",
    text: "text-[11px]",
    border_color: "border-gray-300",
    text_bg: "bg-gray-100",
    text_color: "text-gray-600",
  },
  md: {
    container: "w-14 h-14",
    text: "text-sm",
    border_color: "border-gray-300",
    text_bg: "bg-gray-100",
    text_color: "text-gray-700",
  },
  lg: {
    container: "w-18 h-18",
    text: "text-xl",
    border_color: "border-gray-300",
    text_bg: "bg-gray-100",
    text_color: "text-gray-800",
  },
  xl: {
    container: "w-26 h-26",
    text: "text-3xl",
    border_color: "border-gray-300",
    text_bg: "bg-gray-100",
    text_color: "text-gray-900",
  },
};

// ✅ Named export
export function Avatar({ src, name, size = "md" }) {
  const {
    container,
    text,
    border_color,
    text_bg,
    text_color,
  } = sizeMap[size] || sizeMap.md;

  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  return (
    <div
      className={`${container} rounded-full overflow-hidden border-[.5px] ${border_color}
                  flex items-center justify-center shrink-0`}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? "avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <span
          className={`${text} ${text_bg} ${text_color}
                       w-full h-full flex items-center justify-center font-medium`}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

// ─── Demo Profiles ───────────────────────────────────────────────
const profiles = [
  { size: "xsm", label: "Xtra Small", src: null, name: "user1" },
  { size: "sm", label: "Small", src: null, name: "user2" },
  { size: "md", label: "Medium", src: null, name: "user3" },
  { size: "lg", label: "Large", src: null, name: "user4" },
  { size: "xl", label: "Extra Large", src: null, name: "user5" },
];

// ✅ Only ONE default export
export default function ProfileAvatar() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-end gap-8 flex-wrap justify-center">
        {profiles.map(({ size, label, src, name }) => (
          <div key={size} className="flex flex-col items-center gap-2">
            <Avatar src={src} name={name} size={size} />
            <span className="text-xs font-medium text-gray-600">{label}</span>
            <span className="text-xs text-gray-400">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}