"use client";

import { EntityPage } from "@/components/entity-page";
import { buttonClass } from "@/components/kit";
import { useStore } from "@/lib/store";

export default function BookmarksPage() {
  const { data, openForm } = useStore();
  return (
    <EntityPage
      entity="bookmarks"
      lead={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-mute">Folders</span>
          {data.folders.map((f) => (
            <button key={f.id} type="button" onClick={() => openForm("folders", { id: f.id })} className={buttonClass("outline", "min-h-8 px-2.5 text-xs")}>
              {String(f.name || "Untitled")}
            </button>
          ))}
          <button type="button" onClick={() => openForm("folders")} className={buttonClass("ghost", "min-h-8 px-2.5 text-xs")}>
            Add folder
          </button>
        </div>
      }
    />
  );
}
