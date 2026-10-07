"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore, type Item } from "@/lib/store";
import { ENTITIES, type EntityKey } from "@/lib/entities";
import { Modal } from "@/components/dialogs";
import { NAV } from "@/components/app-sidebar";
import { inputClass } from "@/components/kit";
import { cn } from "@/lib/utils";

type Cmd = { label: string; hint: string; run: () => void };

const SEARCHABLE = (Object.keys(ENTITIES) as EntityKey[]).filter((e) => e !== "folders");

// Matches any string or string-array value on a record: titles, bodies, tags, dates.
function matches(item: Item, q: string) {
  return Object.values(item)
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .some((v) => typeof v === "string" && v.toLowerCase().includes(q));
}

export function CommandPalette() {
  const { palette, setPalette, openForm, data, theme, setTheme } = useStore();
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPalette]);

  const needle = q.trim().toLowerCase();

  const commands: Cmd[] = [
    ...SEARCHABLE.map((e) => ({
      label: `New ${ENTITIES[e].singular}`,
      hint: "Create",
      run: () => openForm(e),
    })),
    ...NAV.map((n) => ({ label: `Go to ${n.label}`, hint: "Page", run: () => router.push(n.href) })),
    { label: "Open settings", hint: "Page", run: () => router.push("/settings") },
    {
      label: `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
      hint: "Theme",
      run: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
  ].filter((c) => !needle || c.label.toLowerCase().includes(needle));

  const records = needle
    ? SEARCHABLE.flatMap((e) =>
        data[e]
          .filter((i) => matches(i, needle))
          .map((i) => ({
            label: String(i[ENTITIES[e].titleKey] || "Untitled"),
            hint: ENTITIES[e].singular,
            run: () => openForm(e, { id: i.id }),
          })),
      ).slice(0, 12)
    : [];

  const all = [...records, ...commands];

  function runAt(i: number) {
    const item = all[i];
    if (!item) return;
    setPalette(false);
    item.run();
  }

  return (
    <Modal
      open={palette}
      onClose={() => {
        setPalette(false);
        setQ("");
        setActive(0);
      }}
      title="Command palette"
    >
      <div className="p-3">
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, all.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              runAt(active);
            }
          }}
          placeholder="Search records or type a command"
          aria-label="Search records or type a command"
          className={inputClass}
        />
      </div>
      <ul className="max-h-80 overflow-y-auto px-2 pb-2">
        {all.map((c, i) => (
          <li key={`${c.hint}-${c.label}-${i}`}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => runAt(i)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm",
                i === active ? "bg-raised" : "hover:bg-raised",
              )}
            >
              <span className="truncate">{c.label}</span>
              <span className="shrink-0 text-xs text-mute">{c.hint}</span>
            </button>
          </li>
        ))}
        {all.length === 0 ? <li className="px-3 py-6 text-center text-sm text-mute">No results yet</li> : null}
      </ul>
    </Modal>
  );
}
