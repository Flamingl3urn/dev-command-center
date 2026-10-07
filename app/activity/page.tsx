"use client";

import { EmptyState, PageHeader, Panel } from "@/components/kit";
import { useStore } from "@/lib/store";
import { fmtDay, todayIso } from "@/lib/entities";

export default function ActivityPage() {
  const { ready, data } = useStore();
  const today = todayIso();

  // Counts come only from records that exist. Nothing is estimated or seeded.
  const stats = [
    ["Projects completed", data.projects.filter((p) => p.status === "Completed").length],
    ["Tasks completed", data.tasks.filter((t) => t.status === "Done").length],
    ["Tasks overdue", data.tasks.filter((t) => t.dueDate && t.dueDate < today && t.status !== "Done").length],
    ["Bugs resolved", data.bugs.filter((b) => b.status === "Resolved" || b.status === "Closed").length],
    ["Notes created", data.notes.length],
    ["Learning topics", data.topics.length],
    ["Workflows saved", data.workflows.length],
  ] as const;
  const hasAny = stats.some(([, n]) => n > 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Activity" blurb="Changes you make in this workspace, newest first, and the counts they add up to." />

      {ready && data.activity.length === 0 ? (
        <EmptyState title="No activity yet" body="Creating, editing and deleting records shows up here." />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {data.activity.map((a) => (
            <li key={a.id} className="flex items-baseline justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0 truncate">
                <span className="text-mute">
                  {a.verb} {a.entity === "topics" ? "learning topic" : a.entity.replace(/s$/, "")}
                </span>{" "}
                {a.label}
              </span>
              <span className="shrink-0 text-xs text-mute tnum">{fmtDay(a.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}

      <Panel title="Analytics">
        {!hasAny ? (
          <p className="text-sm text-mute">No activity to analyze yet.</p>
        ) : (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {stats.map(([label, n]) => (
              <div key={label}>
                <dt className="text-xs text-mute">{label}</dt>
                <dd className="tnum mt-0.5 text-xl font-semibold">{n}</dd>
              </div>
            ))}
          </dl>
        )}
      </Panel>
    </div>
  );
}
