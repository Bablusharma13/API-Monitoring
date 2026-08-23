import React, { useState } from "react";

// Badge Component
const Badge = ({ text, bgColor, textColor }) => {
  if (!text) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-medium rounded-full ${bgColor} ${textColor}`}
    >
      {text}
    </span>
  );
};

const StatCard = ({
  icon,
  title,
  count,
  badgeText,
  iconColor = "text-gray-500",
  countColor = "text-gray-900",
  titleColor = "text-gray-500",
  badgeBg = "bg-gray-100",
  badgeTextColor = "text-gray-600",
  onClick,
}) => {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(!active);
    onClick && onClick();
  };

  const activeColor = "active-stat-card-text";
  const activeBorder = "active-stat-card-border";

  return (
    <div
      onClick={handleClick}
      className={` inline-flex flex-col p-3 sm:p-4 rounded-2xl bg-white min-w-0 w-full border  transition-all duration-200 stat-card3`}
      style={{ borderWidth: "1px" }}
    >
      {/* Top Row */}
      <div className="flex justify-between items-center gap-4">
        <div className={`text-lg ${active ? activeColor : iconColor}`}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon, {
                width: 20,
                height: 20,
              })
            : icon}
        </div>

        <div
          className={`text-[24px] font-[200] ${
            active ? activeColor : countColor
          }`}
        >
          {count}
        </div>
      </div>

      {/* Title */}
      <div className={`mt-1 text-xs ${active ? activeColor : titleColor}`}>
        {title}
      </div>

      {/* Badge */}
      {badgeText && (
        <div className="mt-2 font-[300]">
          <Badge
            text={badgeText}
            bgColor={badgeBg}
            textColor={badgeTextColor}
          />
        </div>
      )}
    </div>
  );
};

export { StatCard };
