// pages/SamplePage.jsx

import React from 'react';
import { InfoTable } from '../components/ui/InfoTable';

import ToggleView from '../components/ui/ToggleView';

const SamplePage = () => {
  const handleEditClick = () => {
    console.log('Edit clicked');
  };

  const salaryData = [
    {
      section: "Salary Components",
    },
    {
      items: [
        { label: "CTC (Annual)", value: "—" },
        { label: "Basic Salary (Monthly)", value: "₹5,000" },
        { label: "PF Applicable", value: "No" },
        { label: "ESI Applicable", value: "No" },
      ],
    },
    {
      items: [
        { label: "Insurance Applicable", value: "No" },
        { label: "Education Allowance", value: "₹0" },
        { label: "Other Allowance", value: "₹0" },
        { label: "Advance Loan Deduction", value: "₹0" },
      ],
    },
    {
      section: "Bank & Tax Details",
    },
    {
      items: [
        { label: "Account Holder Name", value: "—" },
        { label: "Account Number", value: "—" },
        { label: "IFSC Code", value: "—" },
        { label: "PAN Number", value: "—" },
      ],
    },
    {
      items: [
        { label: "Aadhar Number", value: "—", colSpan: 4 },
      ],
    },
  ];
  const settingsIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
  );

  return (
    <div>
      {/* <div className='w-100 border-gray-500 p-3'> */}
        <ToggleView />
      {/* </div> */}
      {/* <h1>Salary Settings</h1>
      <InfoTable
              icon={settingsIcon}
              title="Salary Settings
"
        subtitle="Configure salary components and bank details"
        // action={
        //     <button
        //     onClick={() => console.log("Edit Click")}
        //     className="inline-flex items-center gap-2 px-3 py-1.5 text-sm 
        //                border border-[#e5e7eb] rounded-md 
        //                bg-[#f9fafb] text-[#6b7280]
        //                hover:bg-[#f3f4f6] hover:text-[#374151]
        //                transition"
        //   >
        //     <svg
        //       width="14"
        //       height="14"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       stroke="currentColor"
        //       strokeWidth="2"
        //     >
        //       <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        //       <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        //     </svg>
          
        //     <span>Edit</span>
        //   </button>
        //   }
        rows={salaryData}
      /> */}
    </div>
  );
};

export default SamplePage;