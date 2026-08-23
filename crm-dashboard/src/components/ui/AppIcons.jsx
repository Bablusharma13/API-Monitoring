import React from "react";

const Svg = ({ width = 20, height = 20, stroke = "currentColor", strokeWidth = 1.8, className = "", children }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth={strokeWidth}
    className={className}
  >
    {children}
  </svg>
);

export const PulseWaveIcon = ({ width = 22, height = 22, stroke = "#2563eb", strokeWidth = 1.8, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Svg>
);

export const InfoCircleIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Svg>
);

export const ClockIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);

export const LockIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

export const CheckCircleIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Svg>
);

export const BellIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export const UsersIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </Svg>
);

export const CalendarIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

export const ShieldIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export const SettingsIcon = ({ width = 14, height = 14, stroke = "#6b7280", strokeWidth = 2, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const MenuLinesIcon = ({ width = 22, height = 22, stroke = "#2563eb", strokeWidth = 1.8, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </Svg>
);

export const IncidentInfoIcon = ({ width = 22, height = 22, stroke = "#dc2626", strokeWidth = 1.8, className = "" }) => (
  <InfoCircleIcon width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className} />
);

export const SuccessCheckIcon = ({ width = 20, height = 20, stroke = "#22c55e", strokeWidth = 1.8, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l2.5 2.5L16 9" />
  </Svg>
);

export const StatusDownIcon = ({ width = 20, height = 20, stroke = "#dc2626", strokeWidth = 1.8, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </Svg>
);

export const WarningTriangleIcon = ({ width = 20, height = 20, stroke = "#f59e0b", strokeWidth = 1.8, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </Svg>
);

export const BarsIcon = ({ width = 20, height = 20, stroke = "#06b6d4", strokeWidth = 1.8, className = "" }) => (
  <Svg width={width} height={height} stroke={stroke} strokeWidth={strokeWidth} className={className}>
    <line x1="6" y1="20" x2="6" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="18" y1="20" x2="18" y2="14" />
  </Svg>
);
