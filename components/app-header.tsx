"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Plus, Search, Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { addDaysIso, agenda, todayIso } from "@/lib/entities";
import { buttonClass } from "@/components/kit";
import { cn } from "@/lib/utils";

// Real events only: overdue tasks, and anything dated today or tomorrow.
function useNotifications() {
  const { data } = useStore();
  const today = todayIso();
  const overdue = data.tasks
    .filter((t) => t.dueDate && t.dueDate < today && t.status !== "Done")
    .map((t) => ({ key: `o-${t.id}`, text: `Overdue: ${t.title || "Untitled task"}` }));
  const soon = agenda(data, today, addDaysIso(today, 1)).map((r) => ({
    key: `a-${r.entity}-${r.id}`,
    text: `${r.date === today ? "Today" : "Tomorrow"}: ${r.title}`,
  }));
  return [...overdue, ...soon];
}

export function AppHeader() {
  const { openForm, setQuickAdd, setPalette } = useStore();
  const notes = useNotifications();
  const [open, setOpen] = React.useState(false);
  const [online, setOnline] = React.useState(true);

  // Read the real connection state once mounted; the server cannot know it.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur md:px-8">
      <button
        type="button"
        onClick={() => setPalette(true)}
        className="flex min-h-10 flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3 text-left text-sm text-mute hover:text-ink md:max-w-sm"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate">Search everything</span>
        <kbd className="hidden rounded border border-line px-1.5 text-[11px] sm:inline">Ctrl K</kbd>
      </button>

      {!online ? (
        <span className="hidden rounded-full border border-line px-2.5 py-1 text-xs text-accent sm:inline">Offline</span>
      ) : null}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={notes.length ? `Notifications, ${notes.length}` : "Notifications"}
          className={buttonClass("ghost", "relative size-10 px-0")}
        >
          <Bell className="size-4" />
          {notes.length ? <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" /> : null}
        </button>
        {open ? (
          <div className="absolute right-0 top-12 z-40 w-72 rounded-lg border border-line bg-surface p-3 shadow-lg">
            {notes.length === 0 ? (
              <p className="px-1 py-3 text-sm text-mute">You&apos;re all caught up.</p>
            ) : (
              <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
                {notes.map((n) => (
                  <li key={n.key} className="rounded-md px-2.5 py-2 text-sm hover:bg-raised">
                    {n.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <button type="button" onClick={() => setQuickAdd(true)} className={cn(buttonClass("primary"), "hidden sm:inline-flex")}>
        <Plus className="size-4" />
        Quick add
      </button>
      <button
        type="button"
        onClick={() => openForm("tasks")}
        aria-label="New task"
        className={cn(buttonClass("outline"), "size-10 px-0 sm:hidden")}
      >
        <Plus className="size-4" />
      </button>

      <Link href="/settings" aria-label="Settings" className={cn(buttonClass("ghost"), "hidden size-10 px-0 md:inline-flex")}>
        <Settings className="size-4" />
      </Link>
    </header>
  );
}
