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

  // Already in 12h format e.g. "3:30 PM" — parse directly
  const match12 = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    return {
      hour:   parseInt(match12[1], 10),
      minute: parseInt(match12[2], 10),
      period: match12[3].toUpperCase(),
    };
  }

  // 24h format e.g. "15:30" or "15:30:00"
  const [hStr, mStr] = v.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return { hour: 12, minute: 0, period: "AM" };
  return { hour: h % 12 || 12, minute: m, period: h >= 12 ? "PM" : "AM" };
};

/** Convert HH:MM → "8:30 AM" for display */
const toDisplay = (v) => {
  if (!v) return "";
  const { hour, minute, period } = parse24h(v);
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`;
};

/**
 * Parse typed string → HH:MM (24h) or null.
 * Accepts: "8:30 AM", "8:30am", "14:30", "830", "1430", "8 AM"
 */
const parseTyped = (raw) => {
  if (!raw) return null;
  const s = raw.trim().toUpperCase().replace(/\./g, ":");

  // 12h with period: "8:30 AM", "8:30AM", "8 AM"
  const h12 = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (h12) {
    let h = parseInt(h12[1]);
    const m = parseInt(h12[2] ?? "0");
    const p = h12[3];
    if (p === "AM" && h === 12) h = 0;
    if (p === "PM" && h !== 12) h += 12;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59)
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // 24h: "08:30" or "8:30"
  const h24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const h = parseInt(h24[1]), m = parseInt(h24[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59)
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Compact: "830" → 8:30, "1430" → 14:30
  const compact = s.match(/^(\d{3,4})$/);
  if (compact) {
    const n = compact[1];
    const h = parseInt(n.slice(0, n.length - 2));
    const m = parseInt(n.slice(-2));
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59)
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return null;
};

const HOURS   = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"];
const ITEM_H  = 40;

// ── Drum column ───────────────────────────────────────────────────────────────
function Drum({ items, selected, onSelect, format = (v) => String(v).padStart(2, "0"), disabled = () => false }) {
  const listRef   = useRef(null);
  const isDragging = useRef(false);
  const startY    = useRef(0);
  const startScroll = useRef(0);
  const snapTimer = useRef(null);

  useEffect(() => {
    const idx = items.indexOf(selected);
    if (idx !== -1 && listRef.current)
      listRef.current.scrollTop = idx * ITEM_H;
  }, [selected, items]);

  const snap = useCallback(() => {
    if (!listRef.current) return;
    const idx = Math.round(listRef.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    const val = items[clamped];
    if (val !== selected && !disabled(val)) onSelect(val);
    listRef.current.scrollTo({ top: items.indexOf(val) * ITEM_H, behavior: "smooth" });
  }, [items, selected, onSelect, disabled]);

  const onScroll = () => { clearTimeout(snapTimer.current); snapTimer.current = setTimeout(snap, 80); };
  const onPointerDown = (e) => { isDragging.current = true; startY.current = e.clientY ?? e.touches?.[0]?.clientY; startScroll.current = listRef.current?.scrollTop ?? 0; };
  const onPointerMove = (e) => { if (!isDragging.current || !listRef.current) return; const y = e.clientY ?? e.touches?.[0]?.clientY; listRef.current.scrollTop = startScroll.current - (y - startY.current); };
  const onPointerUp   = () => { isDragging.current = false; snap(); };

  return (
    <div className="relative flex flex-col items-center select-none" style={{ width: 56 }}>
      <div className="absolute top-0 left-0 right-0 h-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, white 0%, transparent 100%)" }} />
      <div className="absolute left-0 right-0 z-10 pointer-events-none rounded-lg border-2 border-blue-500 bg-blue-50/60" style={{ top: ITEM_H * 2, height: ITEM_H }} />
      <div className="absolute bottom-0 left-0 right-0 h-10 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, white 0%, transparent 100%)" }} />
      <div ref={listRef} onScroll={onScroll}
        onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
        className="overflow-y-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{ height: ITEM_H * 5, width: "100%", scrollSnapType: "y mandatory" }}
      >
        {[0, 1].map(i => <div key={`t${i}`} style={{ height: ITEM_H }} />)}
        {items.map((item) => {
          const isSel = item === selected;
          const isDis = disabled(item);
          return (
            <div key={item} onClick={() => !isDis && onSelect(item)}
              style={{ height: ITEM_H, scrollSnapAlign: "center" }}
              className={`flex items-center justify-center text-sm font-semibold transition-all
                ${isSel ? "text-blue-600 text-base scale-110" : "text-gray-400"}
                ${isDis ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:text-gray-700"}`}
            >
              {format(item)}
            </div>
          );
        })}
        {[0, 1].map(i => <div key={`b${i}`} style={{ height: ITEM_H }} />)}
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
  const [inputText, setInputText] = useState(() => toDisplay(value));
  const [inputError, setInputError] = useState("");
  const ref = useRef(null);

  // Sync when value changes externally
  useEffect(() => {
    const p = parse24h(value);
    setHour(p.hour); setMinute(p.minute); setPeriod(p.period);
    setInputText(toDisplay(value));
  }, [value]);

  const emit = useCallback((h, m, p) => {
    const val = to24h(h, m, p);
    if (minTime && val < minTime) return;
    onChange(val);
    setInputText(toDisplay(val));
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

  // ── Text input handlers ───────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const raw = e.target.value;
    setInputText(raw);
    setInputError("");
    const parsed24 = parseTyped(raw);
    if (parsed24) {
      if (minTime && parsed24 < minTime) { setInputError("Time is before minimum allowed"); return; }
      const p = parse24h(parsed24);
      setHour(p.hour); setMinute(p.minute); setPeriod(p.period);
      onChange(parsed24);
    }
  };

  const handleInputBlur = () => {
    const parsed24 = parseTyped(inputText);
    if (parsed24) {
      setInputText(toDisplay(parsed24)); // normalise
      setInputError("");
    } else if (inputText.trim()) {
      setInputError('Use "8:30 AM", "14:30" or "830"');
    }
  };

  const displayError = error || !!inputError;
  const displayHelper = inputError || helperText;
  const display = toDisplay(value);

  return (
    <div className="flex-1 relative" ref={ref}>
      {label && (
        <label className={`text-xs mb-1 ml-0.5 block ${displayError ? "text-red-600" : "text-gray-500"}`}>{label}</label>
      )}

      {/* Single input — type or click to open drum */}
      <input
        value={open ? inputText : (display || inputText)}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => { setOpen(true); setInputText(display); }}
        placeholder='e.g. 8:30 AM'
        className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-text
          ${displayError ? "border-red-500 focus:ring-red-400" : open ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300 hover:border-gray-400"}`}
      />

      {/* Drum picker dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4"
          style={{ minWidth: 220 }}>
          <p className="text-xs text-center text-gray-400 mb-3 font-medium tracking-widest uppercase">Scroll or type above</p>

          <div className="flex items-center gap-1 justify-center">
            <Drum items={HOURS} selected={hour} onSelect={handleHour} disabled={(h) => isDisabled(h, minute, period)} />
            <span className="text-2xl font-bold text-gray-300 pb-1">:</span>
            <Drum items={MINUTES} selected={minute} onSelect={handleMinute} disabled={(m) => isDisabled(hour, m, period)} />
            <div className="w-2" />
            <Drum items={PERIODS} selected={period} onSelect={handlePeriod} format={(v) => v} disabled={(p) => isDisabled(hour, minute, p)} />
          </div>

          <div className="mt-3 text-center">
            <span className="text-lg font-bold text-blue-600 tracking-wider">{display || "—"}</span>
          </div>

          <button type="button" onClick={() => setOpen(false)}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {displayHelper && (
        <p className={`text-xs mt-0.5 ml-0.5 ${displayError ? "text-red-600" : "text-gray-500"}`}>{displayHelper}</p>
      )}
    </div>
  );
}
