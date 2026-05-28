import { formatTaskDate, isTaskOverdue, type TaskStatusValue } from "@/lib/tasks/constants";
import { TaskOverdueBadge } from "@/components/tasks/task-overdue-badge";

export function TaskDueDate({
  dueDate,
  status,
}: {
  dueDate: Date | null;
  status: TaskStatusValue | string;
}) {
  const overdue = isTaskOverdue(dueDate, status);

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className={overdue ? "font-medium text-amber-800" : undefined}>
        {formatTaskDate(dueDate)}
      </span>
      {overdue ? <TaskOverdueBadge /> : null}
    </span>
  );
}
