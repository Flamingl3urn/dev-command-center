export type FieldType =
  | "text"
  | "textarea"
  | "code"
  | "url"
  | "date"
  | "time"
  | "number"
  | "select"
  | "tags"
  | "check"
  | "ref";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  to?: EntityKey;
  required?: boolean;
  wide?: boolean;
  unit?: string;
};

export type EntityKey =
  | "projects"
  | "tasks"
  | "bugs"
  | "notes"
  | "prompts"
  | "workflows"
  | "models"
  | "tools"
  | "topics"
  | "bookmarks"
  | "folders"
  | "snippets"
  | "events";

export type Entity = {
  label: string;
  singular: string;
  href: string;
  blurb: string;
  titleKey: string;
  fields: Field[];
  meta: string[];
  dateKey?: string;
  groupKey?: string;
  defaults?: Record<string, unknown>;
  empty: { title: string; body: string; cta: string };
};

// Records are user-shaped; field types are enforced by the form schema, not TypeScript.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

const f = (key: string, label: string, type: FieldType = "text", extra: Partial<Field> = {}): Field => ({
  key,
  label,
  type,
  ...extra,
});

const PROJECT_STATUS = ["Idea", "Planning", "Development", "Testing", "Deployed", "Paused", "Completed", "Archived"];
const PRIORITY = ["Low", "Medium", "High"];
const TASK_STATUS = ["Backlog", "Todo", "In Progress", "Blocked", "Done"];
const SEVERITY = ["Low", "Medium", "High", "Critical"];
const BUG_STATUS = ["Open", "In Progress", "Resolved", "Closed"];
const EVENT_TYPES = ["Personal", "University", "Project", "Meeting", "Deadline", "Reminder"];
const LEVEL = ["Beginner", "Intermediate", "Advanced"];
const BOOKMARK_TYPE = ["Article", "Docs", "Repo", "Video", "Tool", "Other"];

export const ENTITIES: Record<EntityKey, Entity> = {
  projects: {
    label: "Projects",
    singular: "project",
    href: "/projects",
    blurb: "Every codebase you are working on, with its status, links and deadline.",
    titleKey: "name",
    fields: [
      f("name", "Name", "text", { required: true }),
      f("description", "Description", "textarea", { wide: true }),
      f("status", "Status", "select", { options: PROJECT_STATUS }),
      f("priority", "Priority", "select", { options: PRIORITY }),
      f("stack", "Technology stack", "tags"),
      f("repoUrl", "Repository URL", "url"),
      f("demoUrl", "Demo URL", "url"),
      f("localPath", "Local project path"),
      f("deployPlatform", "Deployment platform"),
      f("deadline", "Deadline", "date"),
      f("tags", "Tags", "tags"),
    ],
    meta: ["status", "priority", "deadline"],
    dateKey: "deadline",
    groupKey: "status",
    defaults: { status: "Idea", priority: "Medium" },
    empty: {
      title: "No projects yet",
      body: "Create your first project to start organizing your development work.",
      cta: "Create your first project",
    },
  },
  tasks: {
    label: "Tasks",
    singular: "task",
    href: "/tasks",
    blurb: "Work to do, grouped by status. Switch to a board or calendar when that helps.",
    titleKey: "title",
    fields: [
      f("title", "Title", "text", { required: true }),
      f("description", "Description", "textarea", { wide: true }),
      f("status", "Status", "select", { options: TASK_STATUS }),
      f("priority", "Priority", "select", { options: PRIORITY }),
      f("project", "Project", "ref", { to: "projects" }),
      f("dueDate", "Due date", "date"),
      f("estimate", "Estimated time", "text"),
      f("tags", "Tags", "tags"),
      f("subtasks", "Subtasks (one per line)", "textarea", { wide: true }),
      f("notes", "Notes", "textarea", { wide: true }),
    ],
    meta: ["project", "priority", "dueDate", "estimate"],
    dateKey: "dueDate",
    groupKey: "status",
    defaults: { status: "Todo", priority: "Medium" },
    empty: {
      title: "No tasks yet",
      body: "Add a task to start planning what you will ship.",
      cta: "Create task",
    },
  },
  bugs: {
    label: "Bugs",
    singular: "bug",
    href: "/bugs",
    blurb: "Defects you have seen or reproduced, from report to resolution.",
    titleKey: "title",
    fields: [
      f("title", "Title", "text", { required: true }),
      f("description", "Description", "textarea", { wide: true }),
      f("project", "Project", "ref", { to: "projects" }),
      f("severity", "Severity", "select", { options: SEVERITY }),
      f("status", "Status", "select", { options: BUG_STATUS }),
      f("reproSteps", "Reproduction steps", "textarea", { wide: true }),
      f("expected", "Expected behavior", "textarea"),
      f("actual", "Actual behavior", "textarea"),
      f("environment", "Environment"),
      f("relatedTask", "Related task", "ref", { to: "tasks" }),
      f("relatedNote", "Related note", "ref", { to: "notes" }),
      f("resolvedAt", "Resolved date", "date"),
    ],
    meta: ["project", "severity", "status", "createdAt"],
    groupKey: "status",
    defaults: { status: "Open", severity: "Medium" },
    empty: {
      title: "No bugs recorded",
      body: "Log a bug with the steps to reproduce it, so you can track it to a fix.",
      cta: "Report a bug",
    },
  },
  notes: {
    label: "Notes",
    singular: "note",
    href: "/notes",
    blurb: "Markdown notes, linked to the projects and tasks they belong to.",
    titleKey: "title",
    fields: [
      f("title", "Title", "text", { required: true }),
      f("body", "Body (Markdown)", "code", { wide: true }),
      f("project", "Related project", "ref", { to: "projects" }),
      f("relatedTask", "Related task", "ref", { to: "tasks" }),
      f("tags", "Tags", "tags"),
      f("favorite", "Favorite", "check"),
    ],
    meta: ["project", "tags"],
    empty: {
      title: "No notes yet",
      body: "Write down decisions, commands and context while you work.",
      cta: "Create your first note",
    },
  },
  prompts: {
    label: "Prompts",
    singular: "prompt",
    href: "/ai-library",
    blurb: "Prompts that worked, so you stop rewriting them.",
    titleKey: "title",
    fields: [
      f("title", "Title", "text", { required: true }),
      f("prompt", "Prompt", "code", { wide: true, required: true }),
      f("purpose", "Purpose"),
      f("category", "Category"),
      f("recommendedModel", "Recommended model", "ref", { to: "models" }),
      f("variables", "Variables", "tags"),
      f("tags", "Tags", "tags"),
      f("notes", "Notes", "textarea", { wide: true }),
      f("favorite", "Favorite", "check"),
    ],
    meta: ["category", "recommendedModel"],
    empty: {
      title: "No prompts yet",
      body: "Save a prompt that worked, with its purpose and the model it suits.",
      cta: "New prompt",
    },
  },
  workflows: {
    label: "Workflows",
    singular: "workflow",
    href: "/ai-library",
    blurb: "Repeatable sequences of prompts, models and tools.",
    titleKey: "name",
    fields: [
      f("name", "Name", "text", { required: true }),
      f("description", "Description", "textarea", { wide: true }),
      f("steps", "Steps (one per line)", "textarea", { wide: true }),
      f("modelsUsed", "Models used", "tags"),
      f("toolsUsed", "Tools used", "tags"),
      f("notes", "Notes", "textarea", { wide: true }),
    ],
    meta: ["modelsUsed", "toolsUsed"],
    empty: {
      title: "No AI workflows yet",
      body: "Describe a repeatable sequence of prompts, models and tools.",
      cta: "New workflow",
    },
  },
  models: {
    label: "Models",
    singular: "model",
    href: "/ai-library",
    blurb: "Models you use, so prompts and workflows can refer to them.",
    titleKey: "name",
    fields: [
      f("name", "Name", "text", { required: true }),
      f("notes", "Notes", "textarea", { wide: true }),
    ],
    meta: [],
    empty: {
      title: "No models added",
      body: "Add the models you use, with notes on what each one is good for.",
      cta: "Add model",
    },
  },
  tools: {
    label: "Tools",
    singular: "tool",
    href: "/ai-library",
    blurb: "Tools that sit around your models.",
    titleKey: "name",
    fields: [
      f("name", "Name", "text", { required: true }),
      f("notes", "Notes", "textarea", { wide: true }),
    ],
    meta: [],
    empty: {
      title: "No tools added",
      body: "Add the tools your workflows rely on.",
      cta: "Add tool",
    },
  },
  topics: {
    label: "Learning",
    singular: "learning topic",
    href: "/learning",
    blurb: "What you are learning, your level, and the goal you are working toward.",
    titleKey: "technology",
    fields: [
      f("technology", "Technology", "text", { required: true }),
      f("currentLevel", "Current level", "select", { options: LEVEL }),
      f("goal", "Goal", "textarea", { wide: true }),
      f("progress", "Progress", "number", { unit: "%" }),
      f("resources", "Resources", "textarea", { wide: true }),
      f("practiceTasks", "Practice tasks", "textarea", { wide: true }),
      f("notes", "Notes", "textarea", { wide: true }),
      f("lastStudied", "Last studied", "date"),
      f("nextTopic", "Next topic"),
    ],
    meta: ["currentLevel", "progress", "lastStudied"],
    empty: {
      title: "No learning topics yet",
      body: "Add a technology you are learning, with your level and what you want to reach.",
      cta: "Add topic",
    },
  },
  bookmarks: {
    label: "Bookmarks",
    singular: "bookmark",
    href: "/bookmarks",
    blurb: "Links to docs, articles and repos you want to keep.",
    titleKey: "title",
    fields: [
      f("title", "Title", "text", { required: true }),
      f("url", "URL", "url", { required: true }),
      f("description", "Description", "textarea", { wide: true }),
      f("type", "Type", "select", { options: BOOKMARK_TYPE }),
      f("project", "Project", "ref", { to: "projects" }),
      f("folder", "Folder", "ref", { to: "folders" }),
      f("tags", "Tags", "tags"),
      f("read", "Read", "check"),
      f("favorite", "Favorite", "check"),
      f("notes", "Notes", "textarea", { wide: true }),
    ],
    meta: ["type", "project"],
    empty: {
      title: "No bookmarks yet",
      body: "Save links to docs, articles and repos you want to come back to.",
      cta: "Add bookmark",
    },
  },
  folders: {
    label: "Folders",
    singular: "folder",
    href: "/bookmarks",
    blurb: "Groups for bookmarks.",
    titleKey: "name",
    fields: [f("name", "Name", "text", { required: true })],
    meta: [],
    empty: { title: "No folders yet", body: "Create a folder to group bookmarks.", cta: "Add folder" },
  },
  snippets: {
    label: "Snippets",
    singular: "snippet",
    href: "/snippets",
    blurb: "Code you reuse, with its language and where it came from.",
    titleKey: "title",
    fields: [
      f("title", "Title", "text", { required: true }),
      f("language", "Language"),
      f("code", "Code", "code", { wide: true, required: true }),
      f("description", "Description", "textarea", { wide: true }),
      f("project", "Project", "ref", { to: "projects" }),
      f("tags", "Tags", "tags"),
      f("notes", "Notes", "textarea", { wide: true }),
      f("favorite", "Favorite", "check"),
    ],
    meta: ["language", "project"],
    empty: {
      title: "No snippets yet",
      body: "Keep code you reuse, with its language and the project it came from.",
      cta: "Create snippet",
    },
  },
  events: {
    label: "Events",
    singular: "event",
    href: "/calendar",
    blurb: "Events, deadlines and reminders on the calendar.",
    titleKey: "title",
    fields: [
      f("title", "Title", "text", { required: true }),
      f("type", "Type", "select", { options: EVENT_TYPES }),
      f("date", "Date", "date", { required: true }),
      f("time", "Time", "time"),
      f("notes", "Notes", "textarea", { wide: true }),
    ],
    meta: ["type", "time"],
    dateKey: "date",
    defaults: { type: "Personal" },
    empty: {
      title: "Nothing scheduled",
      body: "Add an event, deadline or reminder to see it on the calendar.",
      cta: "Add event",
    },
  },
};

export const pad = (n: number) => String(n).padStart(2, "0");

export function isoDay(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const todayIso = () => isoDay(new Date());

export function addDaysIso(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  return isoDay(new Date(y, m - 1, d + n));
}

export function fmtDay(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export type AgendaRow = { entity: EntityKey; id: string; date: string; title: string; kind: string };

// Real dated records only: events, task due dates, project deadlines. Lexical ISO compare.
export function agenda(data: Record<string, Row[]>, from: string, to: string): AgendaRow[] {
  const rows: AgendaRow[] = [];
  for (const key of ["events", "tasks", "projects"] as EntityKey[]) {
    const def = ENTITIES[key];
    const dk = def.dateKey!;
    for (const r of data[key] ?? []) {
      const date = r[dk];
      if (!date || date < from || date > to) continue;
      if (key === "tasks" && r.status === "Done") continue;
      rows.push({
        entity: key,
        id: r.id,
        date,
        title: String(r[def.titleKey] || "Untitled"),
        kind: key === "events" ? r.type || "Event" : def.singular,
      });
    }
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}
