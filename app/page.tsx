"use client";

import * as React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { addDaysIso, agenda, fmtDay, todayIso, type AgendaRow, type EntityKey } from "@/lib/entities";
import { buttonClass } from "@/components/kit";

const ONBOARD_KEY = "dcc-onboarding-dismissed";

function greeting(h: number) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Upcoming rows arrive sorted by date, so one pass keeps that order while grouping by day.
function groupByDay(rows: AgendaRow[]) {
  const groups: { date: string; rows: AgendaRow[] }[] = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && last.date === r.date) last.rows.push(r);
    else groups.push({ date: r.date, rows: [r] });
  }
  return groups;
}

export default function CommandCenter() {
  const { ready, data, update, openForm } = useStore();
  const [now, setNow] = React.useState<Date | null>(null);
  const [onboardingOff, setOnboardingOff] = React.useState(true);

  // Clock and stored flags are only readable after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setNow(new Date());
    try {
      setOnboardingOff(localStorage.getItem(ONBOARD_KEY) === "1");
    } catch {}
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dismissOnboarding = () => {
    setOnboardingOff(true);
    try {
      localStorage.setItem(ONBOARD_KEY, "1");
    } catch {}
  };

  const today = todayIso();
  const total = Object.entries(data).reduce((n, [k, v]) => (k === "activity" ? n : n + v.length), 0);
  const dueToday = data.tasks.filter((t) => t.dueDate === today && t.status !== "Done");
  const focus = data.projects.find((p) => p.status === "Development");
  const openTasksFor = (id: string) => data.tasks.filter((t) => t.project === id && t.status !== "Done").length;
  const upcoming = groupByDay(agenda(data, today, addDaysIso(today, 7)).slice(0, 12));
  const recent = data.activity.slice(0, 6);
  const projectName = (id?: string) => data.projects.find((p) => p.id === id)?.name;

  return (
    <div className="flex flex-col gap-12">
      <header>
        <p className="font-mono text-xs text-mute tnum">
          {now ? now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : " "}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{now ? greeting(now.getHours()) : "Welcome"}</h1>
      </header>

      {ready && total === 0 && !onboardingOff ? (
        <section aria-label="Welcome" className="flex flex-col gap-3 border-l-2 border-accent pl-5">
          <h2 className="font-semibold">Welcome to your Dev Command Center.</h2>
          <p className="text-sm text-mute">Everything here is yours. Start with a project, a task, or a note.</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <button type="button" onClick={() => openForm("projects")} className={buttonClass("primary")}>
              Create project
            </button>
            <button type="button" onClick={() => openForm("tasks")} className={buttonClass("outline")}>
              Create task
            </button>
            <button type="button" onClick={() => openForm("notes")} className={buttonClass("outline")}>
              Create note
            </button>
            <button type="button" onClick={dismissOnboarding} className={buttonClass("ghost")}>
              Dismiss
            </button>
          </div>
        </section>
      ) : null}

      {/* The answer to "what now?": the count of work due today, beside the project in focus. */}
      <section aria-label="Summary" className="grid gap-8 border-b border-line pb-10 md:grid-cols-[auto_1fr] md:items-end md:gap-16">
        <p className="flex items-baseline gap-4">
          <span className="text-8xl font-semibold leading-none tracking-tighter tnum md:text-9xl">{dueToday.length}</span>
          <span className="max-w-[16ch] text-lg leading-snug text-mute">
            {dueToday.length === 1 ? "task due today" : "tasks due today"}
          </span>
        </p>

        {focus ? (
          <button type="button" onClick={() => openForm("projects", { id: focus.id })} className="group flex flex-col items-start text-left">
            <span className="text-2xl font-semibold tracking-tight group-hover:text-accent">{focus.name}</span>
            <span className="mt-1.5 font-mono text-xs text-mute tnum">
              {focus.deadline ? `due ${fmtDay(focus.deadline)}` : "no deadline"}
              {` · ${openTasksFor(focus.id)} open`}
            </span>
          </button>
        ) : (
          <p className="max-w-[46ch] text-sm leading-relaxed text-mute">
            {data.projects.length === 0 && total === 0
              ? "Create a project or task to begin."
              : "No project in Development. Set one to focus on it here."}
          </p>
        )}
      </section>

      <div className="grid gap-12 md:grid-cols-[3fr_2fr] md:gap-16">
        <section aria-labelledby="today-heading" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="today-heading" className="text-sm font-semibold">
              Today
            </h2>
            {dueToday.length ? (
              <Link href="/tasks" className="text-xs text-mute hover:text-ink">
                All tasks
              </Link>
            ) : null}
          </div>

          {dueToday.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-2">
              <p className="text-sm text-mute">Nothing due today.</p>
              <button type="button" onClick={() => openForm("tasks", { defaults: { dueDate: today } })} className={buttonClass("outline")}>
                Add task
              </button>
            </div>
          ) : (
            <ul className="flex flex-col">
              {dueToday.map((t) => (
                <li key={t.id} className="flex items-center gap-4 border-t border-line py-3 first:border-t-0">
                  <input
                    type="checkbox"
                    checked={t.status === "Done"}
                    onChange={() => update("tasks", t.id, { status: t.status === "Done" ? "Todo" : "Done" })}
                    aria-label={`Mark ${t.title} done`}
                    className="size-4 shrink-0 accent-accent"
                  />
                  <button type="button" onClick={() => openForm("tasks", { id: t.id })} className="min-w-0 flex-1 truncate text-left">
                    {t.title}
                  </button>
                  <span className="shrink-0 font-mono text-xs text-mute">{projectName(t.project) ?? t.estimate ?? ""}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="upcoming-heading" className="flex flex-col gap-4">
          <h2 id="upcoming-heading" className="text-sm font-semibold">
            Next 7 days
          </h2>
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-2">
              <p className="text-sm text-mute">Nothing scheduled.</p>
              <button type="button" onClick={() => openForm("events")} className={buttonClass("outline")}>
                Add event
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {upcoming.map((g) => (
                <div key={g.date} className="flex flex-col">
                  <h3 className="font-mono text-xs text-mute tnum">{fmtDay(g.date)}</h3>
                  <ul className="mt-1 flex flex-col">
                    {g.rows.map((r) => (
                      <li key={`${r.entity}-${r.id}`}>
                        <button
                          type="button"
                          onClick={() => openForm(r.entity as EntityKey, { id: r.id })}
                          className="flex w-full items-baseline justify-between gap-3 border-t border-line py-2 text-left"
                        >
                          <span className="truncate text-sm">{r.title}</span>
                          <span className="shrink-0 font-mono text-xs text-mute">{r.kind}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-12 md:grid-cols-[3fr_2fr] md:gap-16">
        <section aria-labelledby="projects-heading" className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="projects-heading" className="text-sm font-semibold">
              Projects
            </h2>
            {data.projects.length ? (
              <Link href="/projects" className="text-xs text-mute hover:text-ink">
                All projects
              </Link>
            ) : null}
          </div>
          {data.projects.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-2">
              <p className="text-sm text-mute">No projects yet.</p>
              <button type="button" onClick={() => openForm("projects")} className={buttonClass("outline")}>
                Create project
              </button>
            </div>
          ) : (
            <ul className="flex flex-col">
              {data.projects.slice(0, 5).map((p) => (
                <li key={p.id} className="border-t border-line first:border-t-0">
                  <button type="button" onClick={() => openForm("projects", { id: p.id })} className="flex w-full items-baseline justify-between gap-3 py-2.5 text-left">
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    <span className="shrink-0 font-mono text-xs text-mute">{p.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="activity-heading" className="flex flex-col gap-4">
          <h2 id="activity-heading" className="text-sm font-semibold">
            Activity
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm text-mute">Changes you make appear here.</p>
          ) : (
            <ul className="flex flex-col font-mono text-xs">
              {recent.map((a) => (
                <li key={a.id} className="flex gap-3 border-t border-line py-2 first:border-t-0">
                  <span className="shrink-0 text-mute tnum">{fmtDay(a.createdAt)}</span>
                  <span className="min-w-0 truncate">
                    <span className="text-mute">
                      {a.verb.toLowerCase()} {a.entity === "topics" ? "learning topic" : a.entity.replace(/s$/, "")}
                    </span>{" "}
                    {a.label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <nav aria-label="Quick capture" className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-6 text-sm">
        {[
          ["Task", "tasks"],
          ["Note", "notes"],
          ["Project", "projects"],
          ["Bug", "bugs"],
          ["Prompt", "prompts"],
          ["Bookmark", "bookmarks"],
          ["Snippet", "snippets"],
        ].map(([label, e]) => (
          <button key={label} type="button" onClick={() => openForm(e as EntityKey)} className="text-mute hover:text-ink">
            + {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
