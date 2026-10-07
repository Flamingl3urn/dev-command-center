"use client";

import * as React from "react";
import { EntityPage } from "@/components/entity-page";
import { buttonClass } from "@/components/kit";
import type { EntityKey } from "@/lib/entities";
import { cn } from "@/lib/utils";

const TABS: { key: EntityKey; label: string }[] = [
  { key: "prompts", label: "Prompts" },
  { key: "workflows", label: "Workflows" },
  { key: "models", label: "Models" },
  { key: "tools", label: "Tools" },
];

export default function AiLibraryPage() {
  const [tab, setTab] = React.useState<EntityKey>("prompts");
  return (
    <EntityPage
      key={tab}
      entity={tab}
      title="AI Library"
      blurb="Prompts, workflows, models and tools you use with AI."
      lead={
        <div role="tablist" aria-label="AI Library section" className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(buttonClass(tab === t.key ? "primary" : "outline"), "min-h-9")}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    />
  );
}
