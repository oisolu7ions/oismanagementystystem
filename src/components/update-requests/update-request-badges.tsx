import type {
  UpdateRequestPriority,
  UpdateRequestStatus,
  UpdateRequestType,
} from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  getUpdateRequestPriorityLabel,
  getUpdateRequestPriorityVariant,
  getUpdateRequestStatusLabel,
  getUpdateRequestStatusVariant,
  getUpdateRequestTypeLabel,
} from "@/lib/update-requests/constants";

export function UpdateRequestStatusBadge({ status }: { status: UpdateRequestStatus | string }) {
  return (
    <Badge variant={getUpdateRequestStatusVariant(status)}>
      {getUpdateRequestStatusLabel(status)}
    </Badge>
  );
}

export function UpdateRequestPriorityBadge({
  priority,
}: {
  priority: UpdateRequestPriority | string;
}) {
  return (
    <Badge variant={getUpdateRequestPriorityVariant(priority)}>
      {getUpdateRequestPriorityLabel(priority)}
    </Badge>
  );
}

export function UpdateRequestTypeBadge({ type }: { type: UpdateRequestType | string }) {
  return <Badge variant="muted">{getUpdateRequestTypeLabel(type)}</Badge>;
}
