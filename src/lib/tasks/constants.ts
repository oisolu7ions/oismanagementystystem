export const TASK_STATUS_VALUES = [
  "TODO",
  "IN_PROGRESS",
  "WAITING",
  "DONE",
] as const;

export type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];

export const TASK_PRIORITY_VALUES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

export type TaskPriorityValue = (typeof TASK_PRIORITY_VALUES)[number];

export const taskStatusOptions: { value: TaskStatusValue; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING", label: "Waiting" },
  { value: "DONE", label: "Done" },
];

export const taskPriorityOptions: { value: TaskPriorityValue; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export function getTaskStatusLabel(status: TaskStatusValue | string): string {
  return taskStatusOptions.find((o) => o.value === status)?.label ?? status;
}

export function getTaskPriorityLabel(priority: TaskPriorityValue | string): string {
  return taskPriorityOptions.find((o) => o.value === priority)?.label ?? priority;
}

export function formatTaskDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function taskDateToInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function isTaskOverdue(
  dueDate: Date | null,
  status: TaskStatusValue | string,
): boolean {
  if (!dueDate || status === "DONE") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function getTaskProgressSummary(tasks: { status: TaskStatusValue | string }[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "DONE").length;
  const percentComplete = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentComplete };
}
