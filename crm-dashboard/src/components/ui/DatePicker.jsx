import { useState, useEffect } from "react";
import dayjs from "dayjs";

const WEEK_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const getDateError = (val) => {
  if (!val) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return "Use format YYYY-MM-DD";
  const [, mm, dd] = val.split("-").map(Number);
  if (mm < 1 || mm > 12) return "Month must be 1–12";
  if (dd < 1 || dd > 31) return "Day must be 1–31";
  if (!dayjs(val, "YYYY-MM-DD", true).isValid()) return "Invalid date";
  return null;
};

function DynamicIcon({ state, open, onMouseDown }) {
  const stroke =
    state === "error" ? "#ef4444" :
    state === "value" ? "#16a34a" :
    open ? "#2563eb" : "#9ca3af";

  return (
    <svg
      onMouseDown={onMouseDown}
      className="cursor-pointer"
      width="16" height="16" viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
    >
      {state === "error" ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </>
   ) : state === "value" ? (
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>
      ) : state === "disabled" ? (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </>
      ) : (
        <>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </>
      )}
    </svg>
  );
}

function DateInput({ label, value, setValue, disabled, showError }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("calendar");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [yearPage, setYearPage] = useState(Math.floor(dayjs().year() / 12) * 12);

  const dateError = getDateError(value);
  const isValid =
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    dayjs(value, "YYYY-MM-DD", true).isValid();

  useEffect(() => {
    if (isValid) {
      const d = dayjs(value, "YYYY-MM-DD", true);
      setCurrentMonth(d);
      setYearPage(Math.floor(d.year() / 12) * 12);
    }
  }, [value, isValid]);

  const getState = () => {
    if (disabled) return "disabled";
    if (!value) return "default";
    if (showError || dateError) return "error";
    return "value";
  };

  const state = getState();

  const base = "w-full pl-4 pr-16 py-[6px] rounded-lg border text-sm outline-none transition bg-white";
  const styles = {
    default: "border-gray-300",
    value: "border-green-500 text-green-600 bg-green-50",
    error: "border-red-500 text-red-500 bg-red-100",
    disabled: "bg-gray-100 text-gray-400 cursor-not-allowed",
  };

  const startDay = currentMonth.startOf("month").day();
  const daysInMonth = currentMonth.endOf("month").date();
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  const totalCells = Math.ceil(days.length / 7) * 7;
  while (days.length < totalCells) days.push(null);

  const handlePrev = (e) => {
    e.preventDefault();
    if (mode === "year") { setYearPage((p) => p - 12); return; }
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (mode === "year") { setYearPage((p) => p + 12); return; }
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  return (
    <div className="w-[220px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="relative">
        <span
e          className={`absolute -top-2 left-3 px-1 text-xs z-10
            ${state === "error" ? "text-red-500" : state === "value" ? "text-green-600" : open ? "text-blue-600" : "text-gray-500"}
            ${state === "disabled" ? "bg-gray-100" : state === "value" ? "bg-green-50" : "bg-white"}`}
        >
          {label}
        </span>

        <input
          value={value}
          disabled={disabled}
          placeholder="YYYY-MM-DD"
          onFocus={() => { setOpen(true); setMode("calendar"); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => setValue(e.target.value)}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          className={`${base} ${styles[state]}`}
        />

        <div className="absolute right-3 top-2.5 flex items-center gap-2">
          {open && !disabled && (
            <svg
              onMouseDown={(e) => { e.preventDefault(); setOpen(false); }}
              className="cursor-pointer hover:stroke-gray-700"
              width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke={state === "value" ? "#16a34a" : "#9ca3af"} strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          <DynamicIcon
            state={state}
            open={open}
            onMouseDown={(e) => { e.preventDefault(); if (!disabled) setOpen((p) => !p); }}
          />
        </div>
      </div>

      {state === "default" && (
        <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Click to pick or type a date
        </p>
      )}
      {state === "value" && (
        <p className="text-green-600 text-xs mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {dayjs(value, "YYYY-MM-DD", true).format("dddd, DD MMMM YYYY")}
        </p>
      )}
      {state === "error" && (
        <p className="text-red-500 text-xs mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {dateError || "Invalid date — use format YYYY-MM-DD"}
        </p>
      )}
      {state === "disabled" && (
        <p className="text-gray-400 text-xs mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Read-only — assigned by admin
        </p>
      )}

      {open && !disabled && (
        <div
          className="absolute z-50 mt-2 bg-white border-[0.5px] border-blue-500 rounded-[16px] shadow-lg w-[220px]"
        >
          <div className="flex justify-between items-center px-[10px] pt-[10px] pb-2 border-b border-gray-100">
            <button
              onMouseDown={handlePrev}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border-[0.5px] border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-blue-500">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="flex items-center gap-1">
              <button
                onMouseDown={(e) => { e.preventDefault(); setMode(mode === "month" ? "calendar" : "month"); }}
                className={`text-[12px] font-medium px-2 py-[3px] rounded-[6px] transition border-none outline-none
                  ${mode === "month" ? "bg-blue-50 text-blue-600" : "text-gray-900 hover:bg-gray-100"}`}
              >
                {currentMonth.format("MMM")}
              </button>
              <span className="text-gray-300 text-[11px] select-none">|</span>
              <button
                onMouseDown={(e) => { e.preventDefault(); setMode(mode === "year" ? "calendar" : "year"); }}
                className={`text-[12px] font-medium px-2 py-[3px] rounded-[6px] transition border-none outline-none
                  ${mode === "year" ? "bg-blue-50 text-blue-600" : "text-gray-900 hover:bg-gray-100"}`}
              >
                {currentMonth.format("YYYY")}
              </button>
            </div>
            <button
              onMouseDown={handleNext}
              className="w-7 h-7 flex items-center justify-center rounded-[8px] border-[0.5px] border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-blue-500">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {mode === "calendar" && (
            <div className="px-[10px] pt-[10px]">
              <div className="grid grid-cols-7 text-center text-[11px] text-gray-400 mb-1 gap-0.5">
                {WEEK_DAYS.map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {days.map((d, i) => {
                  const isSelected = d && value === currentMonth.date(d).format("YYYY-MM-DD");
                  const isToday = d && dayjs().isSame(currentMonth.date(d), "day");
                  return (
                    <div
                      key={i}
                      onClick={() => { if (!d) return; setValue(currentMonth.date(d).format("YYYY-MM-DD")); setOpen(false); }}
                      className={`py-1.5 text-[13px] rounded-[9px] transition-colors
                        ${!d ? "pointer-events-none" : "cursor-pointer"}
                        ${isSelected ? "bg-blue-600 text-white"
                          : isToday ? "border border-blue-400 text-blue-600 "
                          : d ? "text-gray-600 hover:bg-blue-50 hover:text-blue-600" : ""}`}
                    >
                      {d || ""}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "month" && (
            <div className="px-[10px] pt-[10px] pb-1 h-[130px] flex items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 w-full">
                {MONTHS_SHORT.map((m, i) => (
                  <button
                    key={m}
                    onMouseDown={(e) => { e.preventDefault(); setCurrentMonth(currentMonth.month(i)); setMode("calendar"); }}
                    className={`text-[12px] py-[7px] rounded-[8px] transition
                      ${currentMonth.month() === i ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "year" && (
            <div className="px-[10px] pt-[10px] pb-1 h-[130px] flex items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 w-full">
                {Array.from({ length: 12 }, (_, i) => yearPage + i).map((y) => (
                  <button
                    key={y}
                    onMouseDown={(e) => { e.preventDefault(); setCurrentMonth(currentMonth.year(y)); setYearPage(Math.floor(y / 12) * 12); setMode("calendar"); }}
                    className={`text-[12px] py-[7px] rounded-[8px] transition
                      ${currentMonth.year() === y ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center px-[10px] py-2 mt-2 bg-gray-100 border-t border-gray-200 rounded-b-[16px]">
            <button
              onClick={() => { setValue(dayjs().format("YYYY-MM-DD")); setOpen(false); setMode("calendar"); }}
              className="flex items-center gap-1.5 text-[12px] text-gray-700 hover:bg-blue-50 bg-white hover:text-blue-500 hover:border-blue-500 border border-transparent px-2 py-1 rounded-[8px] transition"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Today
            </button>
            <button
              onClick={() => { setValue(""); setOpen(false); }}
              className="text-[12px] text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-400 border border-transparent px-2 py-1 rounded-[8px] transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DatePickerApp() {
  const [defaultVal, setDefaultVal] = useState("");
  const [errorVal, setErrorVal] = useState("2026-13-32");
  const [valueVal, setValueVal] = useState("2026-04-09");
  const [meetingVal, setMeetingVal] = useState("2026-05-20");
  const [disabledVal] = useState("2026-03-15");

  return (
    <div className="p-10 flex gap-10 flex-wrap" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <DateInput label="Due Date" value={defaultVal} setValue={setDefaultVal} />
      <DateInput label="Start Date" value={errorVal} setValue={setErrorVal} showError />
      <DateInput label="End Date" value={valueVal} setValue={setValueVal} />
      <DateInput label="Meeting Date" value={meetingVal} setValue={setMeetingVal} />
      <DateInput label="Deadline" value={disabledVal} setValue={() => {}} disabled />
    </div>
  );
}