import { getLeadStatusLabel, type LeadStatusValue } from "@/lib/leads/constants";
import { Badge } from "@/components/ui/badge";

const statusVariants: Record<
  LeadStatusValue,
  "default" | "success" | "warning" | "info" | "muted"
> = {
  NEW: "info",
  CONTACTED: "default",
  CONSULTATION_SCHEDULED: "warning",
  PROPOSAL_SENT: "info",
  WON: "success",
  LOST: "muted",
};

export function LeadStatusBadge({ status }: { status: LeadStatusValue }) {
  return (
    <Badge variant={statusVariants[status]}>
      {getLeadStatusLabel(status)}
    </Badge>
  );
}
