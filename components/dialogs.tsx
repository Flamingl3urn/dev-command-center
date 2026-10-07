"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { ENTITIES, type EntityKey, type Field, type Row } from "@/lib/entities";
import { buttonClass, inputClass } from "@/components/kit";
import { cn } from "@/lib/utils";

const DISCARD = "Discard unsaved changes?";

export function Modal({
  open,
  onClose,
  dirty = false,
  title,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  dirty?: boolean;
  title: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => {
    if (dirty && !window.confirm(DISCARD)) return;
    ref.current?.close();
  };

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onCancel={(e) => {
        if (dirty && !window.confirm(DISCARD)) e.preventDefault();
      }}
      className={cn(
        "m-auto max-h-[85dvh] w-[calc(100%-2rem)] overflow-hidden rounded-lg border border-line bg-surface p-0 text-ink backdrop:bg-black/60",
        wide ? "max-w-2xl" : "max-w-lg",
      )}
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button type="button" onClick={close} className={buttonClass("ghost", "min-h-9 px-2")} aria-label="Close">
          Close
        </button>
      </div>
      <div className="max-h-[calc(85dvh-3.5rem)] overflow-y-auto">{children}</div>
    </dialog>
  );
}

function blankValues(def: (typeof ENTITIES)[EntityKey]) {
  const out: Row = {};
  for (const f of def.fields) {
    out[f.key] = f.type === "tags" ? [] : f.type === "check" ? false : "";
  }
  return out;
}

function RecordForm({
  entity,
  id,
  defaults,
  onDirty,
}: {
  entity: EntityKey;
  id?: string;
  defaults?: Row;
  onDirty: (v: boolean) => void;
}) {
  const { data, add, update, remove, closeForm, toast } = useStore();
  const def = ENTITIES[entity];
  const existing = id ? data[entity].find((i) => i.id === id) : undefined;

  const [initial] = React.useState<Row>(() => ({
    ...blankValues(def),
    ...def.defaults,
    ...defaults,
    ...existing,
  }));
  const [values, setValues] = React.useState<Row>(initial);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  React.useEffect(() => onDirty(dirty), [dirty, onDirty]);

  const set = (key: string, v: unknown) => setValues((p) => ({ ...p, [key]: v }));

  function save(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    for (const f of def.fields) {
      if (f.required && !String(values[f.key] ?? "").trim()) errs[f.key] = `${f.label} is required.`;
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const clean: Row = {};
    for (const f of def.fields) {
      const v = values[f.key];
      clean[f.key] = f.type === "number" ? Number(v) || 0 : v;
    }
    if (existing) {
      update(entity, existing.id, clean);
      toast(`Saved ${def.singular}`);
    } else {
      add(entity, clean);
      toast(`Created ${def.singular}`);
    }
    closeForm();
  }

  function removeRecord() {
    if (!existing) return;
    if (!window.confirm(`Delete this ${def.singular}? This cannot be undone.`)) return;
    remove(entity, existing.id);
    toast(`Deleted ${def.singular}`);
    closeForm();
  }

  return (
    <form onSubmit={save} noValidate className="flex flex-col">
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {def.fields.map((f) => (
          <FieldControl
            key={f.key}
            field={f}
            value={values[f.key]}
            error={errors[f.key]}
            onChange={(v) => set(f.key, v)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5">
        <div className="flex items-center gap-3">
          {existing ? (
            <button type="button" onClick={removeRecord} className={buttonClass("ghost", "text-accent")}>
              Delete
            </button>
          ) : null}
          {dirty ? <span className="text-xs text-mute">Unsaved changes</span> : null}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={closeForm} className={buttonClass("outline")}>
            Cancel
          </button>
          <button type="submit" className={buttonClass("primary")}>
            {existing ? "Save changes" : `Create ${def.singular}`}
          </button>
        </div>
      </div>
    </form>
  );
}

function FieldControl({
  field: f,
  value,
  error,
  onChange,
}: {
  field: Field;
  value: Row[string];
  error?: string;
  onChange: (v: Row[string]) => void;
}) {
  const { data } = useStore();
  const id = `f-${f.key}`;
  const label = (
    <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-mute">
      {f.label}
      {f.required ? <span className="text-accent"> *</span> : null}
    </label>
  );

  let control: React.ReactNode;
  if (f.type === "check") {
    return (
      <div className={cn("flex items-center gap-2 self-end pb-2", f.wide && "sm:col-span-2")}>
        <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-accent" />
        <label htmlFor={id} className="text-sm">
          {f.label}
        </label>
      </div>
    );
  }

  if (f.type === "textarea" || f.type === "code") {
    control = (
      <textarea
        id={id}
        rows={f.type === "code" ? 8 : 3}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClass, "resize-y", f.type === "code" && "font-mono text-[13px]")}
      />
    );
  } else if (f.type === "select") {
    control = (
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">None</option>
        {f.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  } else if (f.type === "ref") {
    const target = f.to!;
    const titleKey = ENTITIES[target].titleKey;
    control = (
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">None</option>
        {data[target].map((r) => (
          <option key={r.id} value={r.id}>
            {String(r[titleKey] || "Untitled")}
          </option>
        ))}
      </select>
    );
  } else if (f.type === "tags") {
    control = (
      <input
        id={id}
        value={Array.isArray(value) ? value.join(", ") : ""}
        onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
        placeholder="Comma separated"
        className={inputClass}
      />
    );
  } else if (f.type === "number") {
    control = (
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          min={0}
          max={f.unit === "%" ? 100 : undefined}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
        {f.unit ? <span className="text-sm text-mute">{f.unit}</span> : null}
      </div>
    );
  } else {
    control = (
      <input
        id={id}
        type={f.type === "url" ? "url" : f.type === "date" ? "date" : f.type === "time" ? "time" : "text"}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    );
  }

  return (
    <div className={cn(f.wide && "sm:col-span-2")}>
      {label}
      {control}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function RecordDialog() {
  const { dialog, closeForm } = useStore();
  const [dirty, setDirty] = React.useState(false);
  const onDirty = React.useCallback((v: boolean) => setDirty(v), []);

  return (
    <Modal
      open={!!dialog}
      onClose={closeForm}
      dirty={dirty}
      wide
      title={dialog ? (dialog.id ? `Edit ${ENTITIES[dialog.entity].singular}` : `New ${ENTITIES[dialog.entity].singular}`) : ""}
    >
      {dialog ? (
        <RecordForm entity={dialog.entity} id={dialog.id} defaults={dialog.defaults} onDirty={onDirty} />
      ) : null}
    </Modal>
  );
}

const QUICK: EntityKey[] = ["tasks", "notes", "projects", "bugs", "prompts", "bookmarks", "snippets", "events", "topics"];

export function QuickAdd() {
  const { quickAdd, setQuickAdd, openForm } = useStore();
  return (
    <Modal open={quickAdd} onClose={() => setQuickAdd(false)} title="Quick add">
      <div className="grid grid-cols-2 gap-2 p-5 sm:grid-cols-3">
        {QUICK.map((e) => (
          <button key={e} type="button" onClick={() => openForm(e)} className={buttonClass("outline", "justify-start")}>
            New {ENTITIES[e].singular}
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex flex-col items-end gap-2 md:inset-x-auto md:bottom-6 md:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-md border border-line bg-raised px-4 py-2.5 text-sm shadow-lg",
            t.tone === "error" && "text-accent",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
