"use client";

import * as React from "react";
import { ENTITIES, type EntityKey, type Row } from "@/lib/entities";
import { supabase } from "@/lib/supabase";

export type Item = Row & { id: string; createdAt: string; updatedAt: string };
export type Collection = EntityKey | "activity";
type Data = Record<Collection, Item[]>;
export type DialogState = { entity: EntityKey; id?: string; defaults?: Record<string, unknown> } | null;
export type Toast = { id: string; message: string; tone: "success" | "error" };
export type Theme = "dark" | "light";

const KEYS = [...(Object.keys(ENTITIES) as EntityKey[]), "activity"] as Collection[];
// Fresh arrays every time: loading pushes into them, so a shared object would accumulate rows across reloads.
const emptyData = () => Object.fromEntries(KEYS.map((k) => [k, []])) as unknown as Data;

const THEME_KEY = "dcc-theme";
const ACTIVITY_CAP = 200;

const nid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// One row per item in `records`, item JSON in `data`. Each call throws on error.
async function check<T>(p: PromiseLike<{ data: T; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return data;
}

const loadRows = () =>
  check(supabase.from("records").select("collection,data").order("created_at", { ascending: false })) as Promise<
    { collection: Collection; data: Item }[]
  >;

const saveRows = (rows: [Collection, Item][]) =>
  check(
    supabase
      .from("records")
      .upsert(rows.map(([collection, data]) => ({ id: data.id, collection, data, created_at: data.createdAt })), { onConflict: "id" }),
  );

const deleteRow = (id: string) => check(supabase.from("records").delete().eq("id", id));

const clearRows = () => check(supabase.from("records").delete().not("id", "is", null));

type Ctx = {
  ready: boolean;
  data: Data;
  items: (c: Collection) => Item[];
  add: (e: EntityKey, values: Row) => string;
  update: (e: EntityKey, id: string, values: Row) => void;
  remove: (e: EntityKey, id: string) => void;
  clearAll: () => void;
  dialog: DialogState;
  openForm: (e: EntityKey, opts?: { id?: string; defaults?: Row }) => void;
  closeForm: () => void;
  quickAdd: boolean;
  setQuickAdd: (v: boolean) => void;
  palette: boolean;
  setPalette: React.Dispatch<React.SetStateAction<boolean>>;
  toasts: Toast[];
  toast: (message: string, tone?: Toast["tone"]) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const StoreCtx = React.createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<Data>(emptyData);
  // Latest data for mutations, so each one can compute its next state and its DB write from the same snapshot.
  const dataRef = React.useRef<Data>(data);
  const [ready, setReady] = React.useState(false);
  const [dialog, setDialog] = React.useState<DialogState>(null);
  const [quickAdd, setQuickAdd] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [theme, setThemeState] = React.useState<Theme>("dark");

  const toast = React.useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = nid();
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const commit = React.useCallback((next: Data) => {
    dataRef.current = next;
    setData(next);
  }, []);

  // Hydrate from Supabase after mount so server and client markup match.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setThemeState(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");
    loadRows()
      .then((rows) => {
        const next = emptyData();
        for (const { collection, data: item } of rows) next[collection]?.push(item);
        next.activity = next.activity.slice(0, ACTIVITY_CAP);
        commit(next);
      })
      .catch(() => toast("Could not load data from Supabase", "error"))
      .finally(() => setReady(true));
  }, [commit, toast]);
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const entry = (verb: string, entity: EntityKey, label: string, at: string): Item => ({
    id: nid(),
    createdAt: at,
    updatedAt: at,
    verb,
    entity,
    label,
  });

  const add = React.useCallback(
    (entity: EntityKey, values: Row) => {
      const id = nid();
      const at = new Date().toISOString();
      const item: Item = { ...values, id, createdAt: at, updatedAt: at };
      const label = String(item[ENTITIES[entity].titleKey] || ENTITIES[entity].singular);
      const act = entry("Created", entity, label, at);
      const prev = dataRef.current;
      commit({ ...prev, [entity]: [item, ...prev[entity]], activity: [act, ...prev.activity].slice(0, ACTIVITY_CAP) });
      saveRows([
        [entity, item],
        ["activity", act],
      ]).catch(() => toast("Could not save to Supabase", "error"));
      return id;
    },
    [commit, toast],
  );

  const update = React.useCallback(
    (entity: EntityKey, id: string, values: Row) => {
      const at = new Date().toISOString();
      const prev = dataRef.current;
      const existing = prev[entity].find((i) => i.id === id);
      if (!existing) return;
      const item: Item = { ...existing, ...values, updatedAt: at };
      const label = String(item[ENTITIES[entity].titleKey] || ENTITIES[entity].singular);
      const act = entry("Updated", entity, label, at);
      commit({
        ...prev,
        [entity]: prev[entity].map((i) => (i.id === id ? item : i)),
        activity: [act, ...prev.activity].slice(0, ACTIVITY_CAP),
      });
      saveRows([
        [entity, item],
        ["activity", act],
      ]).catch(() => toast("Could not save to Supabase", "error"));
    },
    [commit, toast],
  );

  const remove = React.useCallback(
    (entity: EntityKey, id: string) => {
      const at = new Date().toISOString();
      const prev = dataRef.current;
      const existing = prev[entity].find((i) => i.id === id);
      const label = String(existing?.[ENTITIES[entity].titleKey] || ENTITIES[entity].singular);
      const act = entry("Deleted", entity, label, at);
      commit({
        ...prev,
        [entity]: prev[entity].filter((i) => i.id !== id),
        activity: [act, ...prev.activity].slice(0, ACTIVITY_CAP),
      });
      deleteRow(id)
        .then(() => saveRows([["activity", act]]))
        .catch(() => toast("Could not save to Supabase", "error"));
    },
    [commit, toast],
  );

  const clearAll = React.useCallback(() => {
    commit(emptyData());
    clearRows().catch(() => toast("Could not clear Supabase", "error"));
  }, [commit, toast]);

  const openForm = React.useCallback((entity: EntityKey, opts?: { id?: string; defaults?: Row }) => {
    setQuickAdd(false);
    setPalette(false);
    setDialog({ entity, id: opts?.id, defaults: opts?.defaults });
  }, []);

  const closeForm = React.useCallback(() => setDialog(null), []);

  const value: Ctx = {
    ready,
    data,
    items: (c) => data[c],
    add,
    update,
    remove,
    clearAll,
    dialog,
    openForm,
    closeForm,
    quickAdd,
    setQuickAdd,
    palette,
    setPalette,
    toasts,
    toast,
    theme,
    setTheme: setThemeState,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
