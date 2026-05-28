import {
  getTaskStatusLabel,
  type TaskStatusValue,
} from "@/lib/tasks/constants";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<
  TaskStatusValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  TODO: "muted",
  IN_PROGRESS: "info",
  WAITING: "warning",
  DONE: "success",
};

export function TaskStatusBadge({ status }: { status: TaskStatusValue }) {
  return (
    <Badge variant={statusVariants[status]}>{getTaskStatusLabel(status)}</Badge>
  );
}
