import { useState, useEffect, useRef, useCallback } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const to24h = (hour, minute, period) => {
  let h = parseInt(hour);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const parse24h = (v) => {
  if (!v) return { hour: 12, minute: 0, period: "AM" };
  const [h, m] = v.split(":").map(Number);
  return { hour: h % 12 || 12, minute: m, period: h >= 12 ? "PM" : "AM" };
};

const HOURS   = Array.from({ length: 12 }, (_, i) => i + 1);   // 1–12
const MINUTES = Array.from({ length: 60 }, (_, i) => i);        // 0–59
const PERIODS = ["AM", "PM"];

const ITEM_H = 40; // px height of each drum row

// ── Drum column ───────────────────────────────────────────────────────────────
function Drum({ items, selected, onSelect, format = (v) => String(v).padStart(2, "0"), disabled = () => false }) {
  const listRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);

  // Scroll to selected item on mount and when selected changes
  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx !== -1 && listRef.current) {
      listRef.current.scrollTop = idx * ITEM_H;
    }
  }, [selected, items]);

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const idx = Math.round(listRef.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    const val = items[clamped];
    if (val !== selected && !disabled(val)) onSelect(val);
  }, [items, selected, onSelect, disabled]);

  // Snap on scroll end
  const snapTimer = useRef(null);
  const onScroll = () => {
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      handleScroll();
      // Snap scroll position
      if (listRef.current) {
        const idx = items.indexOf(selected);
        listRef.current.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
      }
    }, 80);
  };

  // Touch / mouse drag
  const onPointerDown = (e) => {
    isDragging.current = true;
    startY.current = e.clientY ?? e.touches?.[0]?.clientY;
    startScroll.current = listRef.current?.scrollTop ?? 0;
  };
  const onPointerMove = (e) => {
    if (!isDragging.current || !listRef.current) return;
    const y = e.clientY ?? e.touches?.[0]?.clientY;
    listRef.current.scrollTop = startScroll.current - (y - startY.current);
  };
  const onPointerUp = () => { isDragging.current = false; handleScroll(); };

  return (
    <div className="relative flex flex-col items-center select-none" style={{ width: 56 }}>
      {/* fade top */}
      <div className="absolute top-0 left-0 right-0 h-10 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, white 0%, transparent 100%)" }} />
      {/* selection highlight */}
      <div className="absolute left-0 right-0 z-10 pointer-events-none rounded-lg border-2 border-blue-500 bg-blue-50/60"
        style={{ top: ITEM_H * 2, height: ITEM_H }} />
      {/* fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-10 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, white 0%, transparent 100%)" }} />

      <div
        ref={listRef}
        onScroll={onScroll}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        className="overflow-y-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{ height: ITEM_H * 5, width: "100%", scrollSnapType: "y mandatory" }}
      >
        {/* padding rows so selected item centres */}
        {[0, 1].map(i => <div key={`top-${i}`} style={{ height: ITEM_H }} />)}
        {items.map((item) => {
          const isSelected = item === selected;
          const isDisabled = disabled(item);
          return (
            <div
              key={item}
              onClick={() => !isDisabled && onSelect(item)}
              style={{ height: ITEM_H, scrollSnapAlign: "center" }}
              className={`flex items-center justify-center text-sm font-semibold transition-all
                ${isSelected ? "text-blue-600 text-base scale-110" : "text-gray-400"}
                ${isDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:text-gray-700"}`}
            >
              {format(item)}
            </div>
          );
        })}
        {[0, 1].map(i => <div key={`bot-${i}`} style={{ height: ITEM_H }} />)}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TimePicker12h({ value, onChange, minTime, label, error, helperText }) {
  const parsed = parse24h(value);
  const [hour,   setHour]   = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);
  const [open,   setOpen]   = useState(false);
  const ref = useRef(null);

  // Sync when value changes externally
  useEffect(() => {
    const p = parse24h(value);
    setHour(p.hour);
    setMinute(p.minute);
    setPeriod(p.period);
  }, [value]);

  const emit = useCallback((h, m, p) => {
    const val = to24h(h, m, p);
    if (minTime && val < minTime) return;
    onChange(val);
  }, [minTime, onChange]);

  const handleHour   = (h) => { setHour(h);   emit(h, minute, period); };
  const handleMinute = (m) => { setMinute(m);  emit(hour, m, period); };
  const handlePeriod = (p) => { setPeriod(p);  emit(hour, minute, p); };

  const isDisabled = (h, m, p) => minTime ? to24h(h, m, p) < minTime : false;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const display = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;

  return (
    <div className="flex-1 relative" ref={ref}>
      {label && (
        <label className={`text-xs mb-1 ml-0.5 block ${error ? "text-red-600" : "text-gray-500"}`}>{label}</label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2.5 text-sm bg-white outline-none
          focus:ring-2 focus:ring-blue-500 transition-colors
          ${error ? "border-red-500" : open ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300 hover:border-gray-400"}`}
      >
        <span className={`font-semibold tracking-wide ${value ? "text-gray-800" : "text-gray-400"}`}>
          {value ? display : "Select time"}
        </span>
        <span className="text-gray-400 text-xs">🕐</span>
      </button>

      {/* Drum picker dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4"
          style={{ minWidth: 220 }}>
          <p className="text-xs text-center text-gray-400 mb-3 font-medium tracking-widest uppercase">Select Time</p>

          <div className="flex items-center gap-1 justify-center">
            <Drum
              items={HOURS}
              selected={hour}
              onSelect={handleHour}
              disabled={(h) => isDisabled(h, minute, period)}
            />
            <span className="text-2xl font-bold text-gray-300 pb-1">:</span>
            <Drum
              items={MINUTES}
              selected={minute}
              onSelect={handleMinute}
              disabled={(m) => isDisabled(hour, m, period)}
            />
            <div className="w-2" />
            {/* Period selector — click-only (only 2 items, drum scroll is unreliable) */}
            <div className="flex flex-col gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriod(p)}
                  className={`w-14 h-10 rounded-lg text-sm font-bold border-2 transition-all
                    ${period === p
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Selected time display */}
          <div className="mt-3 text-center">
            <span className="text-lg font-bold text-blue-600 tracking-wider">{display}</span>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {(error || helperText) && (
        <p className={`text-xs mt-0.5 ml-0.5 ${error ? "text-red-600" : "text-gray-500"}`}>{helperText}</p>
      )}
    </div>
  );
}
