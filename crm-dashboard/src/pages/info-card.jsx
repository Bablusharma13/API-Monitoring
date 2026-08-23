import React from "react";
import { InfoCard } from "../components/ui/InfoCard";

const SamplePage = () => {
  const settingsIcon = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#16a34a"
      strokeWidth="2"
    >
      <rect x="1" y="4" width="22" height="16" rx="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  );

  return (
    <div>
      <InfoCard
        icon={settingsIcon}
        title="Stats"
        subtitle="Overview of system data"
        action={
          <span
            className="badge b-blue"
            style={{ fontSize: "11px" }}
          >
            Required
          </span>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-100">
          {/* <div className="bg-gray-100 p-3 rounded">Users: 120</div>
          <div className="bg-gray-100 p-3 rounded">Sales: ₹50K</div> */}
        </div>
      </InfoCard>
    </div>
  );
};

export default SamplePage;