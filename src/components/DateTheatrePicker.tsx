"use client";

import { useState, type FormEvent } from "react";
import { submitRsvp } from "@/lib/rsvp";
import DatePicker from "./DatePicker";

const THEATRE_OPTIONS = [
  "Marina Mall",
  "Imax",
  "The Biggest Screen we could find",
];

type Status = "idle" | "submitting" | "success" | "error";

// Earliest selectable watch date — the day after July 30.
const MIN_WATCH_DATE = "2026-07-31";

export default function DateTheatrePicker() {
  const [date, setDate] = useState("");
  const [theatre, setTheatre] = useState(THEATRE_OPTIONS[0]);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date) return;
    setStatus("submitting");
    const result = await submitRsvp({ decision: "yes", watchDate: date, theatre });
    setStatus(result.ok ? "success" : "error");
  }

  if (status === "success" || status === "error") {
    return (
      <div className="picker-confirmation" role="status">
        <p>
          🕸 Locked in for <strong>{new Date(date + "T00:00:00").toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}</strong> at <strong>{theatre}</strong>.
        </p>
        <p>🚗 I&apos;ll pick you up.</p>
        {status === "error" && (
          <p className="picker-note">
            (Couldn&apos;t reach the web on my end to save that — but consider it noted anyway.)
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="picker-form" onSubmit={handleSubmit}>
      <div className="picker-field">
        <label htmlFor="watch-date">📅 Pick a date</label>
        <DatePicker id="watch-date" value={date} onChange={setDate} minDate={MIN_WATCH_DATE} />
      </div>

      <div className="picker-field">
        <label htmlFor="watch-theatre">🍿 Pick a theatre</label>
        <select id="watch-theatre" value={theatre} onChange={(e) => setTheatre(e.target.value)}>
          {THEATRE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-yes picker-submit" disabled={!date || status === "submitting"}>
        {status === "submitting" ? "Locking it in…" : "🕸 Lock it in"}
      </button>
    </form>
  );
}
