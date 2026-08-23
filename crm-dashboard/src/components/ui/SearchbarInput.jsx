import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchbarInput({ onSearch, onPageReset }) {
  const [searchInput, setSearchInput] = useState("");
  const toolbarRef = useRef(null);

  const handleChange = (e) => {
    setSearchInput(e.target.value);
    onPageReset?.(0);
    onSearch?.(e.target.value.toLowerCase().trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") onPageReset?.(1);
  };

  const handleClear = () => {
    setSearchInput("");
    onPageReset?.(1);
    onSearch?.("");
  };

  return (
    <div className="table-toolbar">
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-[5px] bg-white min-w-[220px] flex-shrink-0 focus-within:border-blue-600 transition-colors">
        <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="border-none outline-none text-[13px] text-gray-800 bg-transparent w-full placeholder-gray-300"
        />
        {searchInput && (
          <button
            onClick={handleClear}
            className="border-none bg-transparent cursor-pointer p-0 flex text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}