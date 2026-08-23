// components/StatCard.jsx
import React from "react";

const StatCard2 = ({
  count = 110,
  label = "Total Records",
  icon = null,
  borderColor = "border-gray-200",
  bgColor = "bg-white",
  textColor = "text-gray-800",
  subTextColor = "text-gray-500",
  iconBg = "bg-green-100",
  iconColor = "text-green-600",
  iconSize = ""
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border ${borderColor} ${bgColor}`}
    >
      {/* Icon */}
      <div
        className={`flex items-center justify-center rounded-full `}
      >
        {icon ? (
          <span className={` ${iconColor} `}>{icon}</span>
        ) : (
          <span className={`text-2xl ${iconColor} ${iconSize}`}>✓</span>
        )}
      </div>

      {/* Content */}
      <div>
        <h2 className={`text-[20px] ${iconColor}`}>
          {count}
        </h2>
        <p className={`text-[11.5px] ${subTextColor}`}>
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatCard2;