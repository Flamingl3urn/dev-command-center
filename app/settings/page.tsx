"use client";

import { PageHeader, Panel, buttonClass } from "@/components/kit";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme, clearAll, toast } = useStore();

  function signOut() {
    supabase.auth.signOut();
  }

  function wipe() {
    if (!window.confirm("Delete everything in this workspace? This cannot be undone.")) return;
    clearAll();
    toast("All data deleted");
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Settings" blurb="Appearance, shortcuts and where your data lives." />

      <Panel title="Appearance">
        <div role="radiogroup" aria-label="Theme" className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              onClick={() => setTheme(t)}
              className={cn(buttonClass(theme === t ? "primary" : "outline"), "capitalize")}
            >
              {t}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Keyboard">
        <p className="text-sm">
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd> or{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-xs">⌘</kbd> +{" "}
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-xs">K</kbd> opens the command palette.
        </p>
      </Panel>

      <Panel title="Data">
        <p className="text-sm text-mute">Your data is stored in your Supabase project. Only signed-in access can read it.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={signOut} className={buttonClass("outline")}>
            Sign out
          </button>
          <button type="button" onClick={wipe} className={cn(buttonClass("outline"), "text-accent")}>
            Delete all data
          </button>
        </div>
      </Panel>
    </div>
  );
}
