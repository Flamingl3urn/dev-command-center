"use client";

import { CalendarGrid } from "@/components/calendar-grid";
import { PageHeader, buttonClass } from "@/components/kit";
import { useStore } from "@/lib/store";
import { agenda, type EntityKey } from "@/lib/entities";

export default function CalendarPage() {
  const { ready, data, openForm } = useStore();
  const rows = agenda(data, "", "9999-12-31");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Calendar"
        blurb="Events, task due dates and project deadlines. Empty days stay empty."
      >
        <button type="button" onClick={() => openForm("events")} className={buttonClass("primary")}>
          Create event
        </button>
        <button type="button" onClick={() => openForm("tasks")} className={buttonClass("outline")}>
          Create task
        </button>
        <button type="button" onClick={() => openForm("events", { defaults: { type: "Deadline" } })} className={buttonClass("outline")}>
          Create deadline
        </button>
        <button type="button" onClick={() => openForm("events", { defaults: { type: "Reminder" } })} className={buttonClass("outline")}>
          Create reminder
        </button>
      </PageHeader>

      {ready ? (
        <>
          <CalendarGrid rows={rows} onSelect={(r) => openForm(r.entity as EntityKey, { id: r.id })} />
          {rows.length === 0 ? <p className="text-center text-sm text-mute">Nothing scheduled</p> : null}
        </>
      ) : null}
    </div>
  );
}
