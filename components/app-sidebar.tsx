"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Bug, Calendar, Code2, CheckSquare, FolderKanban, GraduationCap, Home, Library, Activity, Settings, Plus, Search, StickyNote } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const NAV = [
  { label: "Command Center", href: "/", icon: Home },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Bugs", href: "/bugs", icon: Bug },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "AI Library", href: "/ai-library", icon: Library },
  { label: "Learning", href: "/learning", icon: GraduationCap },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Snippets", href: "/snippets", icon: Code2 },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-surface md:flex">
      <div className="px-5 py-5">
        <p className="text-sm font-semibold">Dev Command Center</p>
        <p className="mt-0.5 text-xs text-mute">Saved in this browser</p>
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            const Icon = n.icon;
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                    active ? "bg-raised font-semibold text-ink" : "text-mute hover:bg-raised hover:text-ink",
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={active ? 2.25 : 2} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="px-5 py-4 text-xs text-mute">Ctrl or ⌘ + K to search</p>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { setQuickAdd, setPalette } = useStore();
  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "Tasks", href: "/tasks", icon: CheckSquare },
  ];
  const cell = "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px]";
  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur md:hidden">
      <ul className="flex pb-[env(safe-area-inset-bottom)]">
        {items.map((n) => {
          const Icon = n.icon;
          const active = isActive(pathname, n.href);
          return (
            <li key={n.href} className="flex flex-1">
              <Link href={n.href} aria-current={active ? "page" : undefined} className={cn(cell, active ? "text-ink" : "text-mute")}>
                <Icon className="size-5" strokeWidth={active ? 2.25 : 2} />
                {n.label}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={() => setQuickAdd(true)} className={cn(cell, "text-ink")}>
            <span className="flex size-8 items-center justify-center rounded-full bg-accent text-onaccent">
              <Plus className="size-5" />
            </span>
            Quick add
          </button>
        </li>
        <li className="flex flex-1">
          <button type="button" onClick={() => setPalette(true)} className={cn(cell, "text-mute")}>
            <Search className="size-5" />
            Search
          </button>
        </li>
      </ul>
    </nav>
  );
}
