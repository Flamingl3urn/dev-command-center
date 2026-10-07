"use client";

import * as React from "react";
import { useStore, type Item } from "@/lib/store";
import { ENTITIES, fmtDay, type EntityKey } from "@/lib/entities";
import { CalendarGrid } from "@/components/calendar-grid";
import { EmptyState, PageHeader, buttonClass, inputClass } from "@/components/kit";
import { cn } from "@/lib/utils";

type View = "list" | "board" | "calendar";
const VIEW_LABEL: Record<View, string> = { list: "List", board: "Board", calendar: "Calendar" };

export function EntityPage({
  entity,
  title,
  blurb,
  lead,
}: {
  entity: EntityKey;
  title?: string;
  blurb?: string;
  lead?: React.ReactNode;
}) {
  const { ready, data, items, openForm } = useStore();
  const def = ENTITIES[entity];
  const rows = items(entity);
  const views: View[] = ["list", ...(def.groupKey ? (["board"] as View[]) : []), ...(def.dateKey ? (["calendar"] as View[]) : [])];
  const [view, setView] = React.useState<View>("list");
  const [query, setQuery] = React.useState("");
  const needle = query.trim().toLowerCase();

  const shown = needle
    ? rows.filter((r) =>
        Object.values(r)
          .flatMap((v) => (Array.isArray(v) ? v : [v]))
          .some((v) => typeof v === "string" && v.toLowerCase().includes(needle)),
      )
    : rows;

  const refTitle = (to: EntityKey, id: string) => {
    const hit = data[to].find((i) => i.id === id);
    return hit ? String(hit[ENTITIES[to].titleKey] || "Untitled") : "";
  };

  const metaText = (r: Item) =>
    def.meta
      .map((k) => {
        if (k === "createdAt") return fmtDay(r.createdAt);
        const f = def.fields.find((x) => x.key === k);
        const v = r[k];
        if (v === undefined || v === "" || v === null) return "";
        if (f?.type === "ref") return refTitle(f.to!, v);
        if (f?.type === "date") return fmtDay(v);
        if (Array.isArray(v)) return v.join(", ");
        if (f?.unit) return `${v}${f.unit}`;
        return String(v);
      })
      .filter(Boolean)
      .join(" · ");

  const openRow = (id: string) => openForm(entity, { id });

  return (
    <div className="flex flex-col gap-5">
      {lead}
      <PageHeader title={title ?? def.label} blurb={blurb ?? def.blurb}>
        {views.length > 1 ? (
          <div role="tablist" aria-label="View" className="flex rounded-md border border-line bg-surface p-0.5">
            {views.map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "min-h-9 rounded px-3 text-sm",
                  view === v ? "bg-raised font-semibold" : "text-mute hover:text-ink",
                )}
              >
                {VIEW_LABEL[v]}
              </button>
            ))}
          </div>
        ) : null}
        <button type="button" onClick={() => openForm(entity)} className={buttonClass("primary")}>
          New {def.singular}
        </button>
      </PageHeader>

      {!ready ? (
        <p className="text-sm text-mute">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState title={def.empty.title} body={def.empty.body}>
          <button type="button" onClick={() => openForm(entity)} className={buttonClass("primary")}>
            {def.empty.cta}
          </button>
        </EmptyState>
      ) : (
        <>
          {view !== "calendar" ? (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Filter ${def.label.toLowerCase()}`}
              aria-label={`Filter ${def.label.toLowerCase()}`}
              className={cn(inputClass, "max-w-sm")}
            />
          ) : null}

          {shown.length === 0 ? <p className="py-6 text-center text-sm text-mute">No results yet</p> : null}

          {view === "list" && shown.length > 0 ? (
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {shown.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => openRow(r.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-raised">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {r.favorite ? <span aria-label="Favorite" className="mr-1.5 text-accent">★</span> : null}
                        {String(r[def.titleKey] || "Untitled")}
                      </span>
                      {metaText(r) ? <span className="mt-0.5 block truncate text-xs text-mute">{metaText(r)}</span> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {view === "board" && def.groupKey ? (
            <div className="grid gap-3 overflow-x-auto md:grid-flow-col md:auto-cols-[minmax(14rem,1fr)]">
              {(def.fields.find((f) => f.key === def.groupKey)?.options ?? []).map((col) => {
                const cards = shown.filter((r) => r[def.groupKey!] === col);
                return (
                  <section key={col} aria-label={col} className="flex min-h-40 flex-col gap-2 rounded-lg bg-surface/60 p-2">
                    <h2 className="flex items-center justify-between px-1.5 py-1 text-xs font-semibold text-mute">
                      {col}
                      <span className="tnum">{cards.length}</span>
                    </h2>
                    {cards.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => openRow(r.id)}
                        className="rounded-md border border-line bg-surface px-3 py-2.5 text-left text-sm hover:bg-raised"
                      >
                        <span className="block font-medium">{String(r[def.titleKey] || "Untitled")}</span>
                        {metaText(r) ? <span className="mt-1 block text-xs text-mute">{metaText(r)}</span> : null}
                      </button>
                    ))}
                  </section>
                );
              })}
            </div>
          ) : null}

          {view === "calendar" && def.dateKey ? (
            <CalendarGrid
              rows={shown
                .filter((r) => r[def.dateKey!])
                .map((r) => ({
                  entity,
                  id: r.id,
                  date: r[def.dateKey!],
                  title: String(r[def.titleKey] || "Untitled"),
                  kind: def.singular,
                }))}
              onSelect={(r) => openRow(r.id)}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
