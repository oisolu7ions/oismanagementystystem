import {
  getTaskPriorityLabel,
  type TaskPriorityValue,
} from "@/lib/tasks/constants";
import { Badge } from "@/components/ui/badge";

const priorityVariants: Record<
  TaskPriorityValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  LOW: "muted",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "warning",
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriorityValue }) {
  return (
    <Badge variant={priorityVariants[priority]}>
      {getTaskPriorityLabel(priority)}
    </Badge>
  );
}
