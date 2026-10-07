"use client";

import * as React from "react";
import { isoDay, todayIso, type AgendaRow } from "@/lib/entities";
import { buttonClass } from "@/components/kit";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Empty days stay empty: only real rows render inside a cell.
export function CalendarGrid({ rows, onSelect }: { rows: AgendaRow[]; onSelect: (r: AgendaRow) => void }) {
  const [month, setMonth] = React.useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const year = month.getFullYear();
  const m = month.getMonth();
  const offset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const today = todayIso();

  const byDay = new Map<string, AgendaRow[]>();
  for (const r of rows) byDay.set(r.date, [...(byDay.get(r.date) ?? []), r]);

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">
          {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setMonth(new Date(year, m - 1, 1))} className={buttonClass("outline", "min-h-9 px-3")} aria-label="Previous month">
            ‹
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date();
              setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
            }}
            className={buttonClass("outline", "min-h-9 px-3")}
          >
            Today
          </button>
          <button type="button" onClick={() => setMonth(new Date(year, m + 1, 1))} className={buttonClass("outline", "min-h-9 px-3")} aria-label="Next month">
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-line text-center text-[11px] text-mute">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: cells }, (_, i) => {
          const dayNum = i - offset + 1;
          const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
          if (!inMonth) return <div key={i} className="min-h-16 border-b border-r border-line bg-canvas/40 md:min-h-24" />;
          const iso = isoDay(new Date(year, m, dayNum));
          const dayRows = byDay.get(iso) ?? [];
          const isToday = iso === today;
          return (
            <div key={i} className="min-h-16 border-b border-r border-line p-1 md:min-h-24 md:p-1.5">
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs tnum",
                  isToday && "bg-accent font-semibold text-onaccent",
                )}
              >
                {dayNum}
              </span>
              <ul className="mt-1 flex flex-col gap-0.5">
                {dayRows.slice(0, 3).map((r) => (
                  <li key={`${r.entity}-${r.id}`}>
                    <button
                      type="button"
                      onClick={() => onSelect(r)}
                      title={`${r.title} (${r.kind})`}
                      className="w-full truncate rounded bg-raised px-1 py-0.5 text-left text-[11px] hover:bg-line"
                    >
                      {r.title}
                    </button>
                  </li>
                ))}
                {dayRows.length > 3 ? <li className="px-1 text-[11px] text-mute">+{dayRows.length - 3} more</li> : null}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
