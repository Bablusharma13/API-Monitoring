import { useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["SU","MO","TU","WE","TH","FR","SA"];

function fmt(d) {
  if (!d) return "";
  return `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`;
}

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOf(d) {
  const r = new Date(d); r.setHours(0,0,0,0); return r;
}

function daysBetween(a, b) {
  return Math.round(Math.abs(startOf(b) - startOf(a)) / (1000*60*60*24)) + 1;
}

function getPresetRange(p) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  if (p === "today")     return [new Date(y,m,d), new Date(y,m,d)];
  if (p === "yesterday") return [new Date(y,m,d-1), new Date(y,m,d-1)];
  if (p === "last7")     return [new Date(y,m,d-6), new Date(y,m,d)];
  if (p === "last30")    return [new Date(y,m,d-29), new Date(y,m,d)];
  if (p === "thisMonth") return [new Date(y,m,1), new Date(y,m+1,0)];
  if (p === "lastMonth") return [new Date(y,m-1,1), new Date(y,m,0)];
  if (p === "thisYear")  return [new Date(y,0,1), new Date(y,11,31)];
  if (p === "curFY") {
    const fyStart = m >= 3 ? new Date(y,3,1) : new Date(y-1,3,1);
    return [fyStart, new Date(fyStart.getFullYear()+1,2,31)];
  }
  if (p === "lastFY") {
    const fyStartY = m >= 3 ? y-1 : y-2;
    return [new Date(fyStartY,3,1), new Date(fyStartY+1,2,31)];
  }
  return [null, null];
}

export default function DateRangePicker() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(today);
  const [rangeEnd, setRangeEnd] = useState(today);
  const [picking, setPicking] = useState(false);
  const [activePreset, setActivePreset] = useState("today");

  function navMonth(dir) {
    let m = viewMonth + dir, y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setViewMonth(m); setViewYear(y);
  }

  function pickDay(d) {
    setActivePreset(null);
    if (!picking || !rangeStart) {
      setRangeStart(d); setRangeEnd(null); setPicking(true);
    } else {
      if (d < rangeStart) { setRangeEnd(rangeStart); setRangeStart(d); }
      else { setRangeEnd(d); }
      setPicking(false);
    }
  }

  function applyPreset(p) {
    const [s, e] = getPresetRange(p);
    setRangeStart(s); setRangeEnd(e); setPicking(false);
    setActivePreset(p);
    setViewYear(s.getFullYear()); setViewMonth(s.getMonth());
  }

  function clearRange() {
    setRangeStart(null); setRangeEnd(null); setPicking(false); setActivePreset(null);
  }

  // Build calendar days
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells = [];

  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ d: new Date(viewYear, viewMonth - 1, prevMonthDays - i), other: true });
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ d: new Date(viewYear, viewMonth, i), other: false });
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7);
  for (let i = 1; i <= remaining; i++)
    cells.push({ d: new Date(viewYear, viewMonth + 1, i), other: true });

  function getDayClass(d, other) {
    const ds = startOf(d);
    const s = rangeStart ? startOf(rangeStart) : null;
    const e = rangeEnd ? startOf(rangeEnd) : null;
    const isToday = sameDay(d, today);

    let base = "w-10 h-8 flex items-center justify-center text-sm cursor-pointer select-none transition-all duration-150 ";

    if (other) {
      base += "text-gray-300 ";
    } else if (s && e && sameDay(ds, s) && sameDay(ds, e)) {
      // single day selected
      return base + "bg-blue-600 text-white  rounded-full";
    } else if (s && sameDay(ds, s)) {
      return base + "bg-blue-600 text-white  " + (e ? "rounded-l-full" : "rounded-full");
    } else if (e && sameDay(ds, e)) {
      return base + "bg-blue-600 text-white  rounded-r-full";
    } else if (s && e && ds > s && ds < e) {
      return base + "bg-blue-50 text-blue-600 rounded-none";
    } else {
      base += isToday ? "font-semibold text-gray-900 " : "text-gray-800 ";
      base += "rounded-full hover:bg-blue-50 hover:text-blue-600";
    }
    return base;
  }

  const presets = [
    { key: "today",     label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "last7",     label: "Last 7 days" },
    { key: "last30",    label: "Last 30 days" },
    { key: "thisMonth", label: "This month" },
    { key: "lastMonth", label: "Last month" },
    { key: "thisYear",  label: "This year" },
  ];

  const fyPresets = [
    { key: "curFY",  label: "Current FY" },
    { key: "lastFY", label: "Last FY" },
  ];

  function PresetBtn({ p, violet = false }) {
    const isActive = activePreset === p.key;
    let cls = "w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all duration-150 cursor-pointer ";
    if (isActive && !violet) {
      cls += "bg-blue-600 text-white border-blue-600";
    } else if (isActive && violet) {
      cls += "bg-violet-600 text-white border-violet-600 ";
    } else if (violet) {
      cls += "bg-white text-violet-600 border-violet-200 hover:bg-violet-50";
    } else {
      cls += "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50";
    }
    return (
      <button className={cls} onClick={() => applyPreset(p.key)}>
        {p.label}
      </button>
    );
  }

  const rangeText = rangeStart && rangeEnd
    ? `${fmt(rangeStart)} → ${fmt(rangeEnd)}`
    : rangeStart ? `${fmt(rangeStart)} → ...` : null;

  const duration = rangeStart && rangeEnd
    ? `${daysBetween(rangeStart, rangeEnd)} day${daysBetween(rangeStart, rangeEnd) > 1 ? "s" : ""}`
    : "";

  const footerText = rangeStart && rangeEnd
    ? `${fmt(rangeStart)} → ${fmt(rangeEnd)}`
    : "Select range";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-3 flex gap-5 w-fit">

        {/* ── Calendar ── */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden w-80">

          {/* Month header */}
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => navMonth(-1)}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-base  text-gray-900 tracking-tight">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={() => navMonth(1)}
              className="w-6 h-6 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-t border-gray-100 px-2 py-1.5">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-400 tracking-wider">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 px-2 pb-2 gap-y-0.5">
            {cells.map(({ d, other }, i) => (
              <div
                key={i}
                className={getDayClass(d, other)}
                onClick={() => pickDay(d)}
              >
                {d.getDate()}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between">
            <span className="font-mono text-xs text-gray-500">{footerText}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => applyPreset("today")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500 text-blue-600 text-xs hover:bg-blue-50 transition-all"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Today
              </button>
              <button
                onClick={clearRange}
                className="text-red-500 text-xs  hover:text-red-600 transition-colors px-1"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex flex-col gap-2.5 w-52">
          <p className="text-xs  text-gray-400 uppercase tracking-widest mb-1">Quick Presets</p>

          {presets.map(p => <PresetBtn key={p.key} p={p} />)}

          <div className="h-px bg-gray-100 my-0.5" />

          {fyPresets.map(p => <PresetBtn key={p.key} p={p} violet />)}

          {/* Selected range box */}
          <div className="mt-1 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-xs  text-gray-400 uppercase tracking-widest mb-1.5">Selected Range</p>
            <p className="font-mono text-xs text-gray-900  leading-relaxed">
              {rangeText || "Not selected"}
            </p>
            {duration && (
              <p className="text-xs text-gray-400 mt-1">{duration}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}