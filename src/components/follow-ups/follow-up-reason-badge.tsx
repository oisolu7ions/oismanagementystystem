import {
  getFollowUpReasonLabel,
  type FollowUpReasonValue,
} from "@/lib/follow-ups/constants";
import { Badge } from "@/components/ui/badge";

export function FollowUpReasonBadge({ reason }: { reason: FollowUpReasonValue }) {
  return <Badge variant="info">{getFollowUpReasonLabel(reason)}</Badge>;
}
