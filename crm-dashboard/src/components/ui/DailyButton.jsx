// PeriodToggle.jsx
export function PeriodToggle({ active, onChange }) {
  const options = ["Daily", "Monthly", "Yearly"];
  return (
    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden divide-x divide-gray-300 bg-white">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`w-16 h-7 text-[12px] font-medium transition-all duration-200 ${
            active === option
              ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// App.jsx
export default function App() {
  const [current, setCurrent] = useState(new Date(2026, 3, 4));
  const [mode, setMode] = useState("Daily");

  const shift = (dir) => {
    const d = new Date(current);
    if (mode === "Daily") d.setDate(d.getDate() + dir);
    else if (mode === "Monthly") d.setMonth(d.getMonth() + dir);
    else d.setFullYear(d.getFullYear() + dir);
    setCurrent(d);
  };

  return (
    <div className="flex items-center justify-between w-full p-6" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <DateNavigator current={current} mode={mode} onPrev={() => shift(-1)} onNext={() => shift(1)} />
      <PeriodToggle active={mode} onChange={setMode} />
    </div>
  );
}