import React from "react";

export const InfoCard = ({
  icon,
  title,
  titleColor = "",
  subtitle = "",
  action,
  children,

}) => {
  return (
    <div className={`bg-white border  info-card rounded-xl overflow-hidden`}>

    <div className={`p-[12px] info-border-botttom bg-gray-50`}>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* Left */}
          <div className="flex gap-1">
            {icon && (
              <div className="w-7 h-7 flex items-center justify-center rounded-lg">
                {icon}
              </div>
            )}

            <div className="flex flex-col justify-center">
              <h2 className={`text-[13px] leading-none ${titleColor || "text-[#1c1f2e]"}`}>
                {title}
              </h2>

              {subtitle && (
                <p className="text-[12.5px] text-[#6b7280] font-[300] mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Action */}
          {action && (
            <div className="w-full sm:w-auto flex justify-end">
              {action}
            </div>
          )}
        </div>
      </div>

      {/* Body (Dynamic Content) */}
      {children && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};