import {
  getFollowUpStatusLabel,
  type FollowUpStatusValue,
} from "@/lib/follow-ups/constants";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<
  FollowUpStatusValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  PENDING: "info",
  COMPLETED: "success",
  MISSED: "warning",
  CANCELLED: "muted",
};

export function FollowUpStatusBadge({ status }: { status: FollowUpStatusValue }) {
  return (
    <Badge variant={statusVariants[status]}>
      {getFollowUpStatusLabel(status)}
    </Badge>
  );
}
