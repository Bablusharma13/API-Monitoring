import React from "react";
import { Summary } from "../components/ui/Summary";

const SamplePage = () => {
  const data = [
    {
      items: [
        { label: "Total Days in Month (March)", value: "31 Days" },
        { label: "Absent Days", value: "-1 Days", valueColor: "red" },
        { label: "Paid Leaves", value: "+1 Days", valueColor: "green" },
        { label: "Missing Data Days", value: "-1 Days", valueColor: "red" },

        { label: "Total Working Days", value: "30 Days" },

        { label: "Gross Earnings", value: "₹5,000.00" },
        { label: "Total Deductions", value: "-₹161.29", valueColor: "red" },

        {
          label: "Net Pay",
          value: "₹4,838.71",
          valueColor: "green",
          isHighlight: true,
        },

        { label: "Status", value: "GENERATED", valueColor: "green" },
        {
          label: "Formula",
          value: "(Gross Earnings – Total Deductions)",
          isMuted: true,
        },
      ],
    },
  ];

  return (
    <div className="p-6 bg-[#f4f6f8] min-h-screen">
      <Summary
        // title="Salary Calculation Summary"
        variant="summary"
        rows={data}
      />
    </div>
  );
};

export default SamplePage;