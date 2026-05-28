import { getClientStatusLabel, type ClientStatusValue } from "@/lib/clients/constants";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<
  ClientStatusValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  ACTIVE: "success",
  INACTIVE: "muted",
  PAST_CLIENT: "default",
  PROSPECT: "info",
};

export function ClientStatusBadge({ status }: { status: ClientStatusValue }) {
  return (
    <Badge variant={statusVariants[status]}>
      {getClientStatusLabel(status)}
    </Badge>
  );
}
