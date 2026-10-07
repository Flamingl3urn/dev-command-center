import * as React from "react";
import { cn } from "@/lib/utils";

export function buttonClass(variant: "primary" | "outline" | "ghost" = "outline", className?: string) {
  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50",
    variant === "primary" && "bg-accent text-onaccent hover:opacity-90",
    variant === "outline" && "border border-line bg-surface hover:bg-raised",
    variant === "ghost" && "text-mute hover:bg-raised hover:text-ink",
    className,
  );
}

export const inputClass =
  "w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-mute focus-visible:outline-2 focus-visible:outline-accent";

export function PageHeader({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-[60ch]">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {blurb ? <p className="mt-1.5 text-sm leading-relaxed text-mute">{blurb}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-line bg-surface p-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line px-6 py-10 text-center">
      <h3 className="font-medium">{title}</h3>
      {body ? <p className="mx-auto mt-1 max-w-sm text-sm text-mute">{body}</p> : null}
      {children ? <div className="mt-4 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
