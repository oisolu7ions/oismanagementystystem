import {
  getProjectStatusLabel,
  type ProjectStatusValue,
} from "@/lib/projects/constants";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<
  ProjectStatusValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  NOT_STARTED: "muted",
  DISCOVERY: "info",
  DESIGN: "info",
  DEVELOPMENT: "default",
  REVIEW: "warning",
  WAITING_ON_CLIENT: "warning",
  COMPLETED: "success",
  PAUSED: "muted",
  CANCELLED: "muted",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatusValue }) {
  return (
    <Badge variant={statusVariants[status]}>
      {getProjectStatusLabel(status)}
    </Badge>
  );
}
