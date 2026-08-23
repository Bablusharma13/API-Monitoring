"use client";

import { useState } from "react";
import { LayoutGrid, Menu } from "lucide-react";

export default function ToggleView() {
  const [view, setView] = useState("grid");

  return (
    <div className="inline-flex   rounded-lg ">
      
      {/* Grid Button */}
      <button
  onClick={() => setView("grid")}
  className={`flex items-center justify-center w-10 h-8   transition-all duration-300 
    rounded-lg rounded-tr-none rounded-br-none ${
      view === "grid"
        ? "bg-blue-600 text-white border border-blue-600 "
        : "text-gray-500 info-card"
    }`}
>
  <LayoutGrid size={16} />
</button>

      {/* List Button */}
      <button
  onClick={() => setView("list")}
  className={`flex items-center justify-center w-10 h-8 transition-all duration-300 
    rounded-lg rounded-tl-none rounded-bl-none ${
      view === "list"
        ? "bg-blue-600 text-white  border border-blue-600 "
        : "text-gray-500 info-card" 
    }`}
>
  <Menu size={16} />
</button>
    </div>
  );
}