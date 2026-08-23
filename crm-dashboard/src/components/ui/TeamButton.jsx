import { useState, useEffect } from "react";

const ChevronLeft = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRight = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function App() {
  const [current, setCurrent] = useState(new Date(2026, 3, 4));
  const [active, setActive] = useState("Daily");
  const options = ["Daily", "Monthly", "Yearly"];


  const fmt = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = d.getFullYear();
    return `${mm}-${dd}-${yy}`;
  };

  const prev = () => {
    const d = new Date(current);
    d.setDate(d.getDate() - 1);
    setCurrent(d);
  };
  const next = () => {
    const d = new Date(current);
    d.setDate(d.getDate() + 1);
    setCurrent(d);
  };

  return (
    // <div
    //   className="flex items-center justify-between w-full p-6 font-weight-light"
    //   style={{ fontFamily: "DM Sans, sans-serif" }}
    // >
<div className="flex items-center justify-between w-full p-6 font-light font-['DM_Sans']">    {/* Date Navigator - Left */}
<div className="flex items-center rounded-xl bg-white w-fit">
  <button
    onClick={prev}
    className="w-7 h-7 flex items-center justify-center text-gray-500 border hover:bg-blue-50 border-gray-300 rounded-l-xl hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all duration-150"
  >
    <ChevronLeft />
  </button>
  <div className="h-7 px-4 flex items-center text-sm text-gray-800 select-none border-t border-b border-gray-300">
    {fmt(current)}
  </div>
  <button
    onClick={next}
    className="w-7 h-7 flex items-center justify-center text-gray-500 border hover:bg-blue-50 border-gray-300 rounded-r-xl hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all duration-150"
  >
    <ChevronRight />
  </button>
</div>

      <div className="flex items-center gap-1">
        {/* Toggle Group - Right */}
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden divide-x-[1.5px] divide-gray-300 bg-white">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => setActive(option)}
              className={`w-16 h-7 text-[12px] font-medium transition-all duration-200 cursor-pointer ${
                active === option
                  ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-gray-100"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
