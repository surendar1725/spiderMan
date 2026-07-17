"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface DatePickerProps {
  id: string;
  value: string;
  onChange: (isoDate: string) => void;
  minDate: string;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m - 1, day: d };
}

function buildGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { iso: string; day: number; inMonth: boolean }[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ iso: toIso(y, m, day), day, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ iso: toIso(year, month, day), day, inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1];
    const { year: ly, month: lm, day: ld } = parseIso(last.iso);
    const next = new Date(ly, lm, ld + 1);
    cells.push({ iso: toIso(next.getFullYear(), next.getMonth(), next.getDate()), day: next.getDate(), inMonth: false });
  }

  return cells;
}

const MONTH_LABEL = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

export default function DatePicker({ id, value, onChange, minDate }: DatePickerProps) {
  const min = parseIso(minDate);
  const initial = value ? parseIso(value) : min;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const cells = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const canGoPrev = viewYear > min.year || (viewYear === min.year && viewMonth > min.month);

  function goPrevMonth() {
    if (!canGoPrev) return;
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
  function goNextMonth() {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function selectDay(iso: string) {
    onChange(iso);
    setOpen(false);
  }

  const displayLabel = value
    ? new Date(value + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Choose a date";

  return (
    <div className="date-picker" ref={containerRef}>
      <button
        type="button"
        id={id}
        className="date-picker-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? "" : "date-picker-placeholder"}>{displayLabel}</span>
        <span aria-hidden="true">📅</span>
      </button>

      {open && (
        <div className="date-picker-panel" role="dialog" aria-label="Choose a date">
          <div className="date-picker-header">
            <button
              type="button"
              className="date-picker-nav"
              onClick={goPrevMonth}
              disabled={!canGoPrev}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="date-picker-month">{MONTH_LABEL.format(new Date(viewYear, viewMonth, 1))}</span>
            <button type="button" className="date-picker-nav" onClick={goNextMonth} aria-label="Next month">
              ›
            </button>
          </div>

          <div className="date-picker-weekdays" aria-hidden="true">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          <div className="date-picker-grid">
            {cells.map((cell) => {
              const isDisabled = cell.iso < minDate;
              const isSelected = cell.iso === value;
              return (
                <button
                  type="button"
                  key={cell.iso}
                  className={[
                    "date-picker-day",
                    !cell.inMonth ? "date-picker-day-outside" : "",
                    isSelected ? "date-picker-day-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={isDisabled}
                  onClick={() => selectDay(cell.iso)}
                  aria-current={isSelected ? "date" : undefined}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
