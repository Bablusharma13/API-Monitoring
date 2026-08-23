import { useState, useRef, useEffect } from "react";

const PRESETS = [
  {
    label: "Today",
    getValue: () => {
      const d = new Date();
      return [d, d];
    },
  },
  {
    label: "Yesterday",
    getValue: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return [d, d];
    },
  },
  {
    label: "Last 7 Days",
    getValue: () => {
      const e = new Date();
      const s = new Date();
      s.setDate(s.getDate() - 6);
      return [s, e];
    },
  },
  {
    label: "Last 30 Days",
    getValue: () => {
      const e = new Date();
      const s = new Date();
      s.setDate(s.getDate() - 29);
      return [s, e];
    },
  },
  {
    label: "This Month",
    getValue: () => {
      const n = new Date();
      return [
        new Date(n.getFullYear(), n.getMonth(), 1),
        new Date(n.getFullYear(), n.getMonth() + 1, 0),
      ];
    },
  },
  {
    label: "Last Month",
    getValue: () => {
      const n = new Date();
      return [
        new Date(n.getFullYear(), n.getMonth() - 1, 1),
        new Date(n.getFullYear(), n.getMonth(), 0),
      ];
    },
  },
  {
    label: "Last 1 Year",
    getValue: () => {
      const e = new Date();
      const s = new Date();
      s.setFullYear(s.getFullYear() - 1);
      return [s, e];
    },
  },
  { label: "All", getValue: () => [null, null] },
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function addMonths(year, month, delta) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(day, start, end) {
  if (!start || !end) return false;
  const [s, e] = start <= end ? [start, end] : [end, start];
  return day > s && day < e;
}

function CalendarMonth({
  year,
  month,
  startDate,
  endDate,
  hoverDate,
  onDayClick,
  onDayHover,
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const rangeEnd = hoverDate && startDate && !endDate ? hoverDate : endDate;

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs  text-slate-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-x-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const isStart = isSameDay(day, startDate);
          const isEnd = isSameDay(day, rangeEnd);
          const inRange = isInRange(day, startDate, rangeEnd);
          const isToday = isSameDay(day, new Date());
          const isSingle = isSameDay(startDate, rangeEnd);

          let cellClass =
            "relative flex items-center justify-center h-9 cursor-pointer select-none text-sm transition-colors";
          let spanClass =
            "z-10 w-full h-8 flex items-center justify-center transition-colors font-medium text-sm rounded-lg";

          if (isStart && isEnd) {
            spanClass += " bg-blue-600 text-white";
          } else if (isStart) {
            spanClass += " bg-blue-600 text-white";
          } else if (isEnd) {
            spanClass += " bg-blue-600 text-white";
          } else if (inRange) {
            spanClass += " bg-blue-500 text-white";
          } else {
            spanClass += " text-slate-700 hover:bg-blue-50 hover:text-blue-600";
          }

          return (
            <div
              key={day.toISOString()}
              className={cellClass}
              onClick={() => onDayClick(day)}
              onMouseEnter={() => onDayHover(day)}
            >
              <span className={spanClass}>{day.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRange({
  startDate: externalStart = null,
  endDate: externalEnd = null,
  onChange,
  placeholder = "Select date range",
  className = "",
}) {
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(externalStart);
  const [end, setEnd] = useState(externalEnd);
  const [hoverDate, setHoverDate] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [left, setLeft] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const right = addMonths(left.year, left.month, 1);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setStart(externalStart);
  }, [externalStart]);
  useEffect(() => {
    setEnd(externalEnd);
  }, [externalEnd]);

  const prevMonth = () => setLeft((l) => addMonths(l.year, l.month, -1));
  const nextMonth = () => setLeft((l) => addMonths(l.year, l.month, 1));

  function handleDayClick(day) {
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
      setActivePreset(null);
    } else {
      if (day < start) {
        setEnd(start);
        setStart(day);
      } else {
        setEnd(day);
      }
      setActivePreset(null);
    }
  }

  function handlePreset(preset) {
    const [s, e] = preset.getValue();
    setStart(s);
    setEnd(e);
    setActivePreset(preset.label);
    if (s) {
      setLeft({ year: s.getFullYear(), month: s.getMonth() });
    } else {
      setLeft({ year: today.getFullYear(), month: today.getMonth() });
    }
  }

  function handleApply() {
    onChange?.({ startDate: start, endDate: end });
    setOpen(false);
  }

  function handleCancel() {
    setStart(externalStart);
    setEnd(externalEnd);
    setOpen(false);
  }

  function fmt(d) {
    if (!d) return "";
    return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
  }

  const triggerLabel =
    start && end
      ? `${fmt(start)} – ${fmt(end)}`
      : start
        ? `${fmt(start)} – ...`
        : placeholder;

  return (
    <div className="relative inline-block" ref={ref}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-md border border-slate-300 bg-white text-sm text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors ${className}`}
      >
        <svg
          className="w-4 h-4 text-slate-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        <span className={start ? "text-slate-800" : "text-slate-400"}>
          {triggerLabel}
        </span>
        {/* ✅ chevron down */}
        <svg
          className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="absolute z-50 top-full mt-1 left-0 bg-white border border-slate-200 rounded-xl shadow-xl flex overflow-hidden"
          style={{ minWidth: "max-content" }}
        >
          <div className="flex flex-col border-r border-slate-100 py-3 px-1 min-w-[145px]">
            {PRESETS.map((p) => {
              const isActive = activePreset === p.label;
              const cls = `text-left px-4 py-1.5 text-sm rounded-lg transition-all border ${
                isActive
                  ? "bg-blue-50 text-blue-700  border-[#2563eb]"
                  : "text-slate-600 border-transparent hover:bg-blue-50 hover:text-blue-600 hover:border-[#2563eb]"
              }`;
              return (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p)}
                  className={cls}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Calendars + footer */}
          <div className="flex flex-col p-4 gap-4">
            <div className="flex gap-8">
              {/* ── Left month ── */}
              <div className="w-56">
                <div className="flex items-center justify-between mb-3">
                  {/* ✅ Left chevron */}
                  <button
                    onClick={prevMonth}
                    className="p-1 rounded hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors"
                    aria-label="Previous month"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M15 18l-6-6 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className=" text-slate-800 text-sm">
                    {MONTHS[left.month]} {left.year}
                  </span>
                  <div className="w-6" />
                </div>
                <CalendarMonth
                  year={left.year}
                  month={left.month}
                  startDate={start}
                  endDate={end}
                  hoverDate={hoverDate}
                  onDayClick={handleDayClick}
                  onDayHover={setHoverDate}
                />
              </div>

              {/* ── Right month ── */}
              <div className="w-56">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-6" />
                  <span className=" text-slate-800 text-sm">
                    {MONTHS[right.month]} {right.year}
                  </span>
                  {/* ✅ Right chevron */}
                  <button
                    onClick={nextMonth}
                    className="p-1 rounded hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors"
                    aria-label="Next month"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <CalendarMonth
                  year={right.year}
                  month={right.month}
                  startDate={start}
                  endDate={end}
                  hoverDate={hoverDate}
                  onDayClick={handleDayClick}
                  onDayHover={setHoverDate}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
